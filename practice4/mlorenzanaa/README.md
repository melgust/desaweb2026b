# Servicio de catálogo

Microservicio de **catálogo de productos** para una tienda en línea, desarrollado con **Java 25**, **Spring Boot 4.1.x** y **PostgreSQL 18**.

El proyecto utiliza una arquitectura limpia organizada por capas, diseñada para crecer sin tener que modificar la lógica de negocio existente.

---

## Estado actual

```text
ESTADO ACTUAL

Autenticación:          DESACTIVADA
OAuth2:                 DESACTIVADO
OIDC:                   DESACTIVADO
JWT:                    DESACTIVADO
Proveedor de identidad: NINGUNO
API Gateway:            NINGUNO
Roles:                  NO APLICADOS
Scopes:                 NO APLICADOS

Arquitectura:

Cliente
   |
   v
catalog-service
   |
   v
PostgreSQL
```

Actualmente, todos los endpoints pueden utilizarse directamente sin enviar un encabezado `Authorization`.

Ejemplo:

```bash
curl http://localhost:8080/api/v1/products
```

La petición funciona sin necesidad de utilizar un token.

---

## 1. Propósito del proyecto

Proporcionar la funcionalidad de catálogo de productos para una tienda en línea mediante un microservicio independiente, extensible y fácil de probar.

Este proyecto representa la primera etapa de un sistema más grande. La autenticación y el API Gateway se implementarán en una etapa futura.

## 2. Arquitectura actual

El cliente, que puede ser Postman, una aplicación frontend o `curl`, se comunica directamente con el servicio.

El servicio procesa las solicitudes y se comunica con PostgreSQL para almacenar y consultar la información de los productos.

Actualmente no existe un API Gateway ni un proveedor de identidad.

```text
Cliente
   |
   v
catalog-service
   |
   v
PostgreSQL
```

## 3. Arquitectura futura

```text
ESTADO FUTURO

Cliente
   |
   v
API Gateway
   |
   v
catalog-service
   |
   v
PostgreSQL

Proveedor de identidad
   |
   +-- OAuth2 / OIDC
   |
   +-- Tokens de acceso JWT
```

El código está organizado para permitir esta evolución sin modificar la lógica de negocio. Solamente será necesario agregar la configuración de seguridad y la infraestructura del API Gateway.

## 4. Estructura de paquetes

```text
com.example.catalog
├── CatalogApplication.java        # Punto de entrada
├── config/
│   └── OpenApiConfig.java         # OpenAPI/Swagger
├── catalog/
│   ├── controller/                # Capa HTTP
│   ├── dto/                       # Contratos HTTP
│   ├── entity/                    # Entidades JPA y enumeraciones
│   ├── mapper/                    # Conversiones entre entidades y DTO
│   ├── repository/                # Persistencia de datos
│   └── service/                   # Lógica de negocio y transacciones
└── common/
    └── exception/                 # Excepciones y manejador global
```

## 5. Responsabilidades del controlador

`ProductController` se encarga únicamente de:

- Recibir las solicitudes HTTP.
- Validar los DTO.
- Llamar al servicio correspondiente.
- Devolver DTO y códigos de estado HTTP apropiados.

El controlador no accede directamente al repositorio, no contiene lógica de negocio y no realiza conversiones entre entidades y DTO.

## 6. Responsabilidades de los DTO

Los DTO definen el contrato HTTP de la aplicación. Las entidades nunca se exponen directamente.

- `ProductRequest`: contiene la información utilizada para crear o actualizar un producto e incluye validaciones de Jakarta Bean Validation.
- `ProductResponse`: representación completa utilizada para consultar un producto individual.
- `ProductSummaryResponse`: representación resumida utilizada al mostrar listas de productos.

## 7. Responsabilidades del servicio

`ProductService` y `ProductServiceImpl` contienen las reglas de negocio, incluyendo:

- Validación de la existencia de los productos.
- Validación de SKU únicos.
- Validación de slug únicos.
- Definición de los límites de las transacciones mediante `@Transactional`.
- Coordinación con el repositorio.
- Uso del mapper para realizar conversiones.

## 8. Responsabilidades del repositorio

`ProductRepository` extiende `JpaRepository` y `JpaSpecificationExecutor`.

Su responsabilidad es manejar únicamente la persistencia de la información, incluyendo consultas derivadas como:

```text
existsBySku
findBySlug
```

También permite aplicar especificaciones para filtros dinámicos.

## 9. Responsabilidades de la entidad

`Product` representa el estado del producto dentro del dominio y la base de datos.

La entidad contiene:

- Identificador principal de tipo UUID.
- Control de concurrencia mediante `@Version`.
- Fechas de auditoría.
- Estado del producto utilizando `ProductStatus`.
- Persistencia del estado como texto.

En esta etapa no existen relaciones JPA con otras entidades.

## 10. Responsabilidades del mapper

`ProductMapper` realiza conversiones explícitas entre objetos:

```text
ProductRequest -> Product
Product -> ProductResponse
Product -> ProductSummaryResponse
```

Las conversiones nunca se realizan directamente en los controladores.

## 11. PostgreSQL

PostgreSQL 18 es la única base de datos utilizada por el proyecto.

La base de datos contiene una sola tabla de negocio:

```text
products
```

No existen tablas para usuarios, roles, permisos o autenticación.

## 12. Flyway

Flyway administra el esquema de la base de datos mediante el archivo:

```text
src/main/resources/db/migration/V1__create_products.sql
```

Hibernate utiliza la siguiente configuración:

```yaml
ddl-auto: validate
```

Por esta razón, Hibernate solamente valida la estructura y nunca crea o modifica el esquema de la base de datos.

## 13. Docker

El proyecto utiliza un `Dockerfile` de múltiples etapas.

La primera etapa construye el proyecto utilizando:

```text
maven:3.9-eclipse-temurin-25
```

La segunda etapa ejecuta la aplicación utilizando:

```text
eclipse-temurin:25-jre
```

La aplicación:

- Se ejecuta con un usuario que no es `root`.
- Expone el puerto `8080`.
- Se configura mediante variables de entorno.

## 14. Docker Compose

El archivo `compose.yml` define exactamente dos servicios:

- `catalog-service`
- `postgres`

PostgreSQL utiliza la imagen `18-alpine`, un volumen persistente y una comprobación de estado o `healthcheck`.

El servicio de catálogo espera hasta que PostgreSQL se encuentre saludable.

Para construir e iniciar el proyecto:

```bash
docker compose up --build
```

## 15. Desarrollo local

### Requisitos

- JDK 25
- Maven
- Docker Desktop

Para iniciar solamente PostgreSQL:

```bash
docker compose up -d postgres
```

Para ejecutar la aplicación desde el IDE o la terminal utilizando el perfil `dev`:

### PowerShell

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```

### Linux o macOS

```bash
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

También se puede utilizar Maven:

```bash
mvn spring-boot:run
```

La configuración de la base de datos se obtiene de variables de entorno con valores predeterminados para el ambiente local:

```text
DATABASE_URL=jdbc:postgresql://localhost:5432/catalog
DATABASE_USERNAME=catalog
DATABASE_PASSWORD=catalog
```

Direcciones disponibles:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Estado del servicio: `http://localhost:8080/actuator/health`

## 16. Ejecución de pruebas

Para ejecutar las pruebas:

### Windows

```powershell
.\mvnw.cmd test
```

### Maven instalado

```bash
mvn test
```

Las pruebas utilizan PostgreSQL mediante Testcontainers y nunca utilizan H2. Por esta razón, Docker Desktop debe estar funcionando.

Las pruebas incluidas son:

- `ProductServiceTest`: pruebas unitarias con Mockito.
- `ProductControllerTest`: pruebas del controlador con `@WebMvcTest`, MockMvc y el servicio simulado.
- `ProductRepositoryTest`: pruebas con `@DataJpaTest` y un contenedor PostgreSQL.
- `ProductIntegrationTest`: prueba completa con `@SpringBootTest`, desde HTTP hasta la base de datos.

La prueba de integración también comprueba que las migraciones de Flyway se ejecuten correctamente y que la API funcione sin autenticación.

## 17. Endpoints REST

| Método | Ruta | Descripción | Estado exitoso |
|---|---|---|---:|
| POST | `/api/v1/products` | Crear un producto | 201 |
| GET | `/api/v1/products` | Listar productos con paginación | 200 |
| GET | `/api/v1/products/{id}` | Obtener un producto por ID | 200 |
| PUT | `/api/v1/products/{id}` | Actualizar un producto | 200 |
| DELETE | `/api/v1/products/{id}` | Eliminar un producto | 204 |

## 18. Paginación

El endpoint `GET /api/v1/products` utiliza `Pageable` de Spring Data:

```http
GET /api/v1/products?page=0&size=20&sort=name,asc
```

Las listas utilizan el DTO `ProductSummaryResponse`.

Las colecciones nunca se devuelven sin límites, ya que siempre utilizan paginación.

## 19. Filtros

Los siguientes filtros son opcionales y pueden combinarse:

```http
GET /api/v1/products?status=ACTIVE
GET /api/v1/products?sku=ABC-123
GET /api/v1/products?search=iphone
```

El parámetro `search` realiza una búsqueda sin diferenciar entre mayúsculas y minúsculas sobre el nombre y la descripción del producto.

## 20. Manejo de errores

`GlobalExceptionHandler` utiliza `@RestControllerAdvice` y devuelve errores siguiendo RFC 9457 Problem Details.

Las respuestas nunca exponen el stack trace de la aplicación.

| Situación | Estado HTTP |
|---|---:|
| Error de validación | 400 |
| Producto no encontrado | 404 |
| SKU o slug duplicado | 409 |
| Violación de integridad de la base de datos | 409 |

Los estados `401` y `403` no forman parte de la API actual porque pertenecen a la futura etapa de seguridad.

## 21. Estado actual de seguridad

La autenticación está completamente desactivada.

Actualmente no se utiliza:

- OAuth2
- OIDC
- JWT
- Proveedor de identidad
- Roles
- Scopes
- API Gateway

El servicio se consume directamente.

## 22. Arquitectura futura con OAuth2 y OIDC

En una etapa futura, el servicio funcionará como un servidor de recursos OAuth2 y validará tokens de acceso JWT emitidos por un proveedor de identidad externo.

Esta funcionalidad se agregará mediante:

```text
SecurityFilterChain
Configuración del decodificador JWT
```

La lógica de negocio existente no necesitará cambios.

## 23. Roles y scopes futuros

Los scopes representan permisos para utilizar la API, mientras que los roles representan perfiles de usuario.

```text
Scopes: catalog:read, catalog:write, catalog:admin

CUSTOMER         -> catalog:read
CATALOG_MANAGER  -> catalog:read, catalog:write
ADMIN            -> catalog:read, catalog:write, catalog:admin
```

Estas funciones todavía no están implementadas.

## 24. API Gateway futuro

En una etapa futura, un API Gateway se encargará de:

- Enrutamiento de peticiones.
- Seguridad global.
- Limitación de solicitudes.
- Configuración CORS.
- Correlación de solicitudes.

El servicio continuará funcionando de forma independiente y no dependerá directamente del API Gateway.

## 25. Cómo agregar nuevas entidades

Cada entidad nueva, por ejemplo `Category`, `Brand` o `ProductImage`, debe seguir el mismo patrón:

```text
Controller -> DTO -> Service -> Repository -> Entity -> Mapper -> Tests -> Migración de Flyway
```

Pasos:

1. Agregar la entidad y sus enumeraciones en `catalog/entity`.
2. Agregar los DTO de solicitud y respuesta en `catalog/dto`.
3. Agregar un mapper en `catalog/mapper`.
4. Agregar un repositorio en `catalog/repository`.
5. Agregar una interfaz de servicio y su implementación en `catalog/service`.
6. Agregar un controlador liviano en `catalog/controller`.
7. Agregar una migración nueva, por ejemplo `V2__...sql`.
8. Agregar pruebas unitarias, pruebas de capa y pruebas de integración.

Nunca debe modificarse la migración `V1` después de que haya sido utilizada.

---

## Tecnologías utilizadas

- Java 25
- Spring Boot 4.1.x
- Spring Web MVC
- Spring Data JPA
- Hibernate
- PostgreSQL 18
- Flyway
- Jakarta Bean Validation
- Spring Boot Actuator
- OpenAPI/Swagger
- springdoc
- JUnit 5
- Mockito
- Testcontainers
- Docker
- Docker Compose