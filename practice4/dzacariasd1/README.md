# catalog-service (MongoDB)

Microservicio de **Catálogo** para una tienda en línea, construido con
**Java 25**, **Spring Boot 4.1.x** y **MongoDB 8**.

Es la conversión del ejemplo de la práctica 4 (`practice4/mcalic1`), que usaba
**PostgreSQL 18** con JPA/Hibernate y Flyway, a una base de datos **documental**.

---

## Lo que cambió y lo que no

El punto del ejercicio es que **la lógica de negocio y el contrato HTTP no
cambian**: el cambio queda confinado a la capa de persistencia.

### Archivos que NO se tocaron

```
controller/ProductController.java      dto/ProductRequest.java
service/ProductService.java            dto/ProductResponse.java
mapper/ProductMapper.java              dto/ProductSummaryResponse.java
entity/ProductStatus.java              common/exception/DuplicateProductException.java
config/OpenApiConfig.java              common/exception/ProductNotFoundException.java
Dockerfile                             catalog/controller/ProductControllerTest.java
```

Las mismas URL, los mismos códigos de estado, los mismos DTO.

### Archivos que sí cambiaron

| Archivo | PostgreSQL | MongoDB |
|---------|-----------|---------|
| `pom.xml` | `spring-boot-starter-data-jpa`, Flyway, driver `postgresql` | `spring-boot-starter-data-mongodb` |
| `entity/Product.java` | `@Entity` + `@Table` | `@Document(collection = "products")` |
| `repository/ProductRepository.java` | `JpaRepository` + `JpaSpecificationExecutor` | `MongoRepository` + fragmento propio |
| `repository/ProductRepositoryCustom/Impl.java` | *(no existía)* | Filtrado dinámico con `MongoTemplate` |
| `config/MongoConfig.java` | *(no existía)* | Auditoría + conversión de `BigDecimal` |
| `service/ProductServiceImpl.java` | `@Transactional` + `Specification` | Sin transacciones, usa `search()` |
| `common/exception/GlobalExceptionHandler.java` | — | Añade `DuplicateKeyException` y bloqueo optimista |
| `db/migration/V1__create_products.sql` | Flyway crea la tabla | **Eliminado**: no hay esquema que migrar |
| `compose.yml` | `postgres:18-alpine` | `mongo:8` |
| `application*.yml` | `spring.datasource` | `spring.data.mongodb` |
| `support/Abstract*IntegrationTest.java` | `PostgreSQLContainer` | `MongoDBContainer` |

---

## Las cinco decisiones de diseño

### 1. El UUID se conserva como `_id`

MongoDB usa `ObjectId` por omisión, pero se mantuvo el `UUID` para que las URL
existentes sigan siendo válidas. El contrato HTTP no debía cambiar porque cambie
el motor de base de datos.

### 2. Los índices únicos sustituyen a las restricciones `UNIQUE`

Ya no hay `CONSTRAINT uq_products_sku UNIQUE (sku)`. Se declara en el documento:

```java
@Indexed(unique = true)
private String sku;
```

y se crean al arrancar con `spring.data.mongodb.auto-index-creation: true`.
Es lo más parecido a lo que hacía Flyway: **MongoDB no tiene esquema, pero sí
tiene índices**, y son ellos los que garantizan la unicidad.

### 3. El precio se guarda como `Decimal128`, no como texto

Por omisión Spring Data guarda un `BigDecimal` **como cadena**. Eso rompería dos
cosas: ordenar por precio pasaría a ser alfabético (el `"9"` quedaría después del
`"10"`) y los rangos numéricos dejarían de funcionar. Por eso `MongoConfig`
registra convertidores a `Decimal128`, el tipo decimal exacto de BSON.

En PostgreSQL esto venía gratis con `NUMERIC(19,4)`; aquí hay que decidirlo.

### 4. No se usa `@Transactional`

La versión con PostgreSQL anotaba el servicio con `@Transactional`. Aquí se quitó
deliberadamente:

- MongoDB garantiza atomicidad **a nivel de documento**, y cada operación de este
  servicio escribe exactamente un documento.
- Las transacciones de varios documentos existen, pero **exigen un replica set**.
  Declararlas sobre la instancia suelta de `compose.yml` fallaría en ejecución.

### 5. El filtrado dinámico se hace con `Criteria`

`JpaSpecificationExecutor` no tiene equivalente. El fragmento
`ProductRepositoryCustom` declara `search(...)` y `ProductRepositoryImpl` lo
implementa armando un `Criteria`, que termina siendo el documento de filtro de
MongoDB. La búsqueda libre usa expresión regular sin distinguir mayúsculas, el
equivalente de `LOWER(...) LIKE '%texto%'`.

---

## Cómo ejecutar

### Con Docker Compose

```bash
cd practice4/dzacariasd1
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| API | <http://localhost:8080/api/v1/products> |
| Swagger UI | <http://localhost:8080/swagger-ui.html> |
| OpenAPI JSON | <http://localhost:8080/v3/api-docs> |
| Health | <http://localhost:8080/actuator/health> |
| MongoDB | `localhost:27017` (`catalog` / `catalog`) |

### Desarrollo local

Requisitos: JDK 25, Maven, Docker.

```bash
docker compose up -d mongo
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

La conexión se lee de una variable de entorno:

```
MONGODB_URI=mongodb://catalog:catalog@localhost:27017/catalog?authSource=admin
```

### Inspeccionar la base

```bash
docker exec -it catalog-mongo mongosh -u catalog -p catalog --authenticationDatabase admin catalog
```

```javascript
db.products.find().limit(3).pretty()
db.products.getIndexes()          // muestra los índices únicos de sku y slug
db.products.countDocuments()
```

---

## Pruebas

```bash
mvn test
```

Usan **MongoDB real vía Testcontainers**, nunca una base embebida — igual que el
ejemplo usaba PostgreSQL y nunca H2. Requiere Docker corriendo.

| Prueba | Qué cubre |
|--------|-----------|
| `ProductServiceTest` | Unitaria con Mockito. Casi idéntica a la original: la lógica no cambió. |
| `ProductControllerTest` | `@WebMvcTest`, servicio simulado. **Sin modificar.** |
| `ProductRepositoryTest` | `@DataMongoTest` contra contenedor: índices únicos, `Decimal128`, filtros y paginación. |
| `ProductIntegrationTest` | `@SpringBootTest`, flujo HTTP → MongoDB completo. |

---

## Endpoints

Sin cambios respecto al ejemplo:

| Método | Ruta | Descripción | Éxito |
|--------|------|-------------|-------|
| POST | `/api/v1/products` | Crear | 201 |
| GET | `/api/v1/products` | Listar (paginado) | 200 |
| GET | `/api/v1/products/{id}` | Obtener por id | 200 |
| PUT | `/api/v1/products/{id}` | Actualizar | 200 |
| DELETE | `/api/v1/products/{id}` | Eliminar | 204 |

Paginación y filtros:

```
GET /api/v1/products?page=0&size=20&sort=name,asc
GET /api/v1/products?status=ACTIVE
GET /api/v1/products?sku=ABC-123
GET /api/v1/products?search=iphone
```

## Errores

`GlobalExceptionHandler` devuelve Problem Details (RFC 9457).

| Situación | Estado |
|-----------|--------|
| Error de validación | 400 |
| Producto no encontrado | 404 |
| SKU o slug duplicado | 409 |
| Índice único violado (`DuplicateKeyException`) | 409 |
| Modificación concurrente (`@Version`) | 409 |

---

## Estado de seguridad

Igual que el ejemplo: autenticación **deshabilitada**. No hay OAuth2, OIDC, JWT,
proveedor de identidad, roles, scopes ni API Gateway. Todos los endpoints son
alcanzables sin cabecera `Authorization`.

```bash
curl http://localhost:8080/api/v1/products   # funciona, sin token
```

## Stack

Java 25 · Spring Boot 4.1.x · Spring Web MVC · **Spring Data MongoDB** ·
**MongoDB 8** · Jakarta Bean Validation · Spring Boot Actuator ·
OpenAPI/Swagger (springdoc) · JUnit 5 · Mockito · Testcontainers · Docker ·
Docker Compose.
