# Práctica 4 — Catalog Service con Spring Boot

**Universidad Mariano Gálvez de Guatemala**  
**Facultad de Ingeniería en Sistemas**  
**Curso:** Desarrollo Web  
**Docente:** Ing. Melvín Cali  

**Estudiante:** Maryori Elizabeth Acifuina Juárez  
**Carné:** 7690 23 6640  

---

## 1. Descripción

Esta práctica consiste en la implementación de un **Catalog Service** utilizando **Spring Boot**, encargado de administrar el catálogo de productos de una tienda mediante una API REST.

El servicio permite realizar operaciones de:

- Creación de productos.
- Consulta de productos.
- Consulta de un producto por identificador.
- Actualización de productos.
- Eliminación de productos.
- Paginación y ordenamiento.
- Filtrado y búsqueda de productos.

La información se almacena en una base de datos **PostgreSQL** y el esquema de la base de datos se administra mediante **Flyway**.

---

## 2. Base utilizada

Para el desarrollo de esta práctica se tomó como referencia la estructura de Catalog Service proporcionada por el docente durante el curso.

A partir de dicha estructura se realizó una implementación dentro de la carpeta personal:

```text
practice4/macifuinaj/
```

La aplicación fue adaptada, configurada y validada de forma independiente para esta entrega.

---

## 3. Tecnologías utilizadas

- Java 25
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Flyway
- Maven
- Docker
- Docker Compose
- Swagger / OpenAPI
- JUnit
- Mockito
- Testcontainers

---

## 4. Arquitectura

El proyecto utiliza una organización por capas:

```text
Cliente / Swagger
       |
       v
ProductController
       |
       v
ProductService
       |
       v
ProductServiceImpl
       |
       v
ProductRepository
       |
       v
PostgreSQL
```

Cada capa posee una responsabilidad específica.

### Controller

`ProductController` recibe las solicitudes HTTP y expone los endpoints REST del catálogo.

### Service

`ProductService` define las operaciones disponibles para la administración de productos.

`ProductServiceImpl` contiene la lógica necesaria para ejecutar dichas operaciones.

### Repository

`ProductRepository` utiliza Spring Data JPA para realizar las operaciones de persistencia sobre PostgreSQL.

### DTO

Los datos recibidos y enviados por la API se manejan mediante DTOs, evitando exponer directamente la entidad de persistencia.

Se utilizan:

```text
ProductRequest
ProductResponse
ProductSummaryResponse
```

### Mapper

`ProductMapper` se encarga de transformar los datos entre entidades y DTOs.

---

## 5. Estructura principal

```text
practice4/macifuinaj/
|
├── Dockerfile
├── compose.yml
├── pom.xml
├── README.md
|
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/macifuinaj/catalog/
    │   │       ├── CatalogApplication.java
    │   │       ├── catalog/
    │   │       │   ├── controller/
    │   │       │   ├── dto/
    │   │       │   ├── entity/
    │   │       │   ├── mapper/
    │   │       │   ├── repository/
    │   │       │   └── service/
    │   │       ├── common/
    │   │       │   └── exception/
    │   │       └── config/
    │   │
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-test.yml
    │       └── db/migration/
    │           └── V1__create_products.sql
    │
    └── test/
        └── java/
            └── com/macifuinaj/catalog/
```

---

## 6. Modelo de producto

El catálogo administra productos con información como:

- SKU
- Nombre
- Slug
- Descripción
- Precio
- Moneda
- Estado

Los estados disponibles para un producto son:

```text
DRAFT
ACTIVE
INACTIVE
```

---

## 7. Endpoints

La API utiliza como ruta base:

```text
/api/v1/products
```

### Crear producto

```http
POST /api/v1/products
```

Ejemplo:

```json
{
  "sku": "LAP-001",
  "name": "Laptop Lenovo",
  "slug": "laptop-lenovo",
  "description": "Laptop para oficina y estudio",
  "price": 4500.00,
  "currency": "GTQ",
  "status": "ACTIVE"
}
```

Respuesta esperada:

```text
201 Created
```

---

### Listar productos

```http
GET /api/v1/products
```

Permite utilizar paginación:

```text
?page=0&size=10
```

También permite ordenamiento:

```text
?page=0&size=10&sort=name,asc
```

Respuesta esperada:

```text
200 OK
```

---

### Consultar producto por ID

```http
GET /api/v1/products/{id}
```

Respuesta esperada cuando existe:

```text
200 OK
```

Si el producto no existe:

```text
404 Not Found
```

---

### Actualizar producto

```http
PUT /api/v1/products/{id}
```

Respuesta esperada:

```text
200 OK
```

---

### Eliminar producto

```http
DELETE /api/v1/products/{id}
```

Respuesta esperada:

```text
204 No Content
```

---

## 8. Base de datos y migraciones

El servicio utiliza **PostgreSQL** como motor de base de datos.

La estructura inicial se crea mediante Flyway utilizando:

```text
src/main/resources/db/migration/V1__create_products.sql
```

Hibernate se utiliza para validar el modelo existente, mientras que Flyway mantiene el control de las migraciones.

La configuración utilizada mantiene:

```yaml
ddl-auto: validate
```

---

## 9. Ejecución con Docker

Desde:

```text
practice4/macifuinaj/
```

ejecutar:

```bash
docker compose up --build
```

Se levantan los contenedores correspondientes al servicio y PostgreSQL.

Los contenedores de esta implementación fueron identificados como:

```text
macifuinaj-catalog-service
macifuinaj-catalog-postgres
```

La aplicación queda disponible en:

```text
http://localhost:8080
```

---

## 10. Swagger

La documentación de la API puede consultarse desde:

```text
http://localhost:8080/swagger-ui.html
```

La documentación OpenAPI fue personalizada para identificar esta implementación como:

```text
Catalog Service API - Maryori Acifuina
```

Desde Swagger es posible probar directamente todas las operaciones CRUD.

---

## 11. Actuator

La información de la aplicación puede consultarse mediante:

```text
http://localhost:8080/actuator/info
```

La aplicación se identifica como:

```text
catalog-service-macifuinaj
```

---

## 12. Corrección realizada en Swagger

Durante las pruebas del endpoint paginado se detectó que Swagger documentaba incorrectamente el parámetro `Pageable`, generando valores inválidos para el campo de ordenamiento.

Inicialmente Swagger enviaba un valor similar a:

```json
{
  "page": 0,
  "size": 1,
  "sort": [
    "string"
  ]
}
```

Spring Data intentaba interpretar dicho valor como una propiedad de la entidad, provocando una respuesta:

```text
500 Internal Server Error
```

Para corregir la documentación del parámetro se agregó:

```java
@ParameterObject Pageable pageable
```

utilizando:

```java
import org.springdoc.core.annotations.ParameterObject;
```

Después de esta modificación Swagger permite enviar correctamente parámetros como:

```text
page=0
size=10
sort=name,asc
```

y el endpoint responde correctamente con:

```text
200 OK
```

---

## 13. Pruebas realizadas

Se verificó manualmente el CRUD completo mediante Swagger.

| Operación | Endpoint | Resultado |
|---|---|---|
| Crear | `POST /api/v1/products` | `201 Created` |
| Listar | `GET /api/v1/products` | `200 OK` |
| Consultar | `GET /api/v1/products/{id}` | `200 OK` |
| Actualizar | `PUT /api/v1/products/{id}` | `200 OK` |
| Eliminar | `DELETE /api/v1/products/{id}` | `204 No Content` |
| Consultar eliminado | `GET /api/v1/products/{id}` | `404 Not Found` |

También se verificó que los productos creados fueran almacenados correctamente en PostgreSQL y posteriormente recuperados mediante la API.

---

## 14. Pruebas automatizadas

El proyecto contiene pruebas para:

```text
ProductController
ProductService
ProductRepository
ProductIntegrationTest
```

También se utiliza **Testcontainers** para realizar pruebas de integración utilizando PostgreSQL dentro de Docker.

Debido a que Maven no se encuentra instalado directamente en el equipo utilizado para la práctica, las pruebas se ejecutaron mediante una imagen oficial de Maven dentro de Docker.

Ejemplo:

```powershell
docker run --rm `
  -v "${PWD}:/workspace" `
  -w /workspace `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal `
  maven:3.9-eclipse-temurin-25 `
  mvn test
```

Resultado obtenido:

```text
BUILD SUCCESS
Failures: 0
Errors: 0
```

---

## 15. Adaptaciones realizadas

Sobre la estructura utilizada como referencia para la práctica se realizaron las siguientes adaptaciones:

- Creación de una implementación propia dentro de `practice4/macifuinaj`.
- Cambio del package base a:

```text
com.macifuinaj.catalog
```

- Actualización de los packages tanto del código principal como de las pruebas.
- Personalización de la información del proyecto en Maven.
- Personalización de la metadata de Spring Boot.
- Personalización de la documentación OpenAPI.
- Personalización de los nombres de los contenedores Docker.
- Corrección de la representación de `Pageable` en Swagger mediante `@ParameterObject`.
- Validación manual del CRUD completo.
- Verificación de persistencia en PostgreSQL.
- Ejecución satisfactoria de las pruebas automatizadas.
- Validación de la ejecución completa mediante Docker Compose.

---

## 16. Resultado

Se obtuvo un Catalog Service funcional capaz de administrar productos mediante una API REST desarrollada con Spring Boot.

La aplicación funciona de forma integrada con PostgreSQL, Flyway, Spring Data JPA, Swagger, Docker y Testcontainers.

Las operaciones CRUD y las pruebas automatizadas fueron ejecutadas correctamente.

---

**Maryori Elizabeth Acifuina Juárez**  
**7690 23 6640**  
**Desarrollo Web — 2026**