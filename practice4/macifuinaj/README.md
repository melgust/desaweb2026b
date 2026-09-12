# Práctica 4 — Catalog Service con MongoDB

**Universidad Mariano Gálvez de Guatemala**  
**Curso:** Desarrollo Web  
**Docente:** Ing. Melvín Cali  
**Estudiante:** Maryori Elizabeth Acifuina Juárez  
**Carné:** 7690 23 6640  

---

## Descripción

Esta práctica implementa un microservicio de catálogo de productos utilizando **Spring Boot y MongoDB**.

Para el desarrollo se tomó como referencia la estructura del Catalog Service proporcionada por el docente. A partir de dicha base se realizó la adaptación de la capa de persistencia originalmente implementada con PostgreSQL y Spring Data JPA para trabajar con una base de datos no relacional MongoDB.

La aplicación permite crear, consultar, actualizar, listar y eliminar productos mediante una API REST.

---

## Tecnologías utilizadas

- Java 25
- Spring Boot
- Spring Web MVC
- Spring Data MongoDB
- MongoDB 8
- Maven
- Docker
- Docker Compose
- Swagger / OpenAPI
- JUnit
- Mockito
- Testcontainers

---

## Arquitectura

La aplicación mantiene una separación por capas:

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
       +---- ProductRepository
       |
       +---- MongoTemplate
       |
       v
MongoDB
```

El controlador gestiona las solicitudes HTTP, el servicio contiene las reglas de negocio y la capa de persistencia utiliza Spring Data MongoDB.

---

## Persistencia con MongoDB

Los productos se almacenan como documentos dentro de la colección:

```text
products
```

La clase `Product` utiliza:

```java
@Document(collection = "products")
```

MongoDB genera automáticamente el identificador del producto al momento de almacenarlo.

Ejemplo de identificador generado:

```text
6aa4a5446c04214a597bfcfa
```

Los campos `sku` y `slug` cuentan con índices únicos para evitar duplicados.

El precio se almacena utilizando el tipo `Decimal128` de MongoDB para conservar precisión decimal.

También se utiliza el versionado optimista mediante `@Version`.

---

## Modelo de producto

Cada documento contiene información como:

```text
id
sku
name
slug
description
price
currency
status
createdAt
updatedAt
version
```

Se utiliza MongoDB Auditing para registrar automáticamente las fechas de creación y actualización mediante:

```java
@CreatedDate
@LastModifiedDate
```

---

## Endpoints

### Crear producto

```http
POST /api/v1/products
```

Ejemplo de cuerpo:

```json
{
  "sku": "LAP-MONGO-001",
  "name": "Laptop Lenovo",
  "slug": "laptop-lenovo-mongo",
  "description": "Producto almacenado en MongoDB",
  "price": 4500.00,
  "currency": "GTQ",
  "status": "ACTIVE"
}
```

---

### Listar productos

```http
GET /api/v1/products
```

El endpoint soporta paginación y filtros opcionales por:

```text
status
sku
search
page
size
sort
```

Ejemplo:

```http
GET /api/v1/products?page=0&size=10&sort=name,asc
```

---

### Consultar producto por ID

```http
GET /api/v1/products/{id}
```

---

### Actualizar producto

```http
PUT /api/v1/products/{id}
```

---

### Eliminar producto

```http
DELETE /api/v1/products/{id}
```

---

## Búsqueda y filtros

La versión original utilizaba `Specification` de Spring Data JPA para construir filtros dinámicos.

En la implementación con MongoDB se utiliza:

```text
MongoTemplate
Query
Criteria
```

Esto permite mantener filtros por estado, SKU y búsqueda libre sobre los campos `name` y `description`.

La búsqueda de texto se realiza de forma no sensible a mayúsculas y minúsculas.

---

## Ejecución con Docker

Desde la carpeta:

```text
practice4/macifuinaj
```

se puede levantar el proyecto utilizando:

```powershell
docker compose up --build -d
```

Para verificar los contenedores:

```powershell
docker compose ps
```

Los contenedores utilizados son:

```text
macifuinaj-catalog-service
macifuinaj-catalog-mongodb
```

La aplicación queda disponible en:

```text
http://localhost:8080
```

MongoDB se expone localmente en:

```text
localhost:27017
```

---

## Configuración de MongoDB

Dentro de Docker Compose el Catalog Service se conecta a MongoDB mediante:

```text
mongodb://mongodb:27017/catalog
```

La configuración se proporciona mediante la variable:

```text
MONGODB_URI
```

MongoDB utiliza un volumen persistente:

```text
mongodb-data
```

---

## Swagger

La documentación interactiva de la API puede consultarse en:

```text
http://localhost:8080/swagger-ui.html
```

Desde Swagger se pueden probar las operaciones CRUD del catálogo.

También se configuró correctamente la paginación de Spring mediante `@ParameterObject`, permitiendo que Swagger represente los parámetros:

```text
page
size
sort
```

de forma adecuada.

---

## Actuator

El estado del servicio puede verificarse mediante:

```text
http://localhost:8080/actuator/health
```

Una ejecución correcta devuelve:

```text
UP
```

También se encuentra habilitado:

```text
http://localhost:8080/actuator/info
```

---

## Verificación directa en MongoDB

Además de probar la API, se verificó directamente la información almacenada dentro de MongoDB.

El contenido de la colección `products` puede consultarse ejecutando:

```powershell
docker exec macifuinaj-catalog-mongodb mongosh catalog --quiet --eval "db.products.find().pretty()"
```

Ejemplo de documento almacenado:

```javascript
{
  _id: ObjectId('6aa4a5446c04214a597bfcfa'),
  sku: 'LAP-MONGO-001',
  name: 'Laptop Lenovo',
  slug: 'laptop-lenovo-mongo',
  description: 'Producto almacenado en MongoDB',
  price: Decimal128('4500'),
  currency: 'GTQ',
  status: 'ACTIVE',
  createdAt: ISODate(...),
  updatedAt: ISODate(...),
  version: Long('0')
}
```

Esto permite comprobar que la información se encuentra persistida como documentos dentro de MongoDB.

---

## Pruebas automatizadas

Se realizaron pruebas unitarias y de integración para diferentes capas de la aplicación.

### ProductControllerTest

Prueba los endpoints REST utilizando `MockMvc`.

Se validan escenarios como:

- Creación correcta.
- Validaciones incorrectas.
- Producto duplicado.
- Consulta por ID.
- Producto inexistente.
- Listado.
- Actualización.
- Eliminación.

---

### ProductServiceTest

Prueba las reglas de negocio utilizando Mockito.

Entre las validaciones realizadas se encuentran:

- Creación de productos.
- SKU duplicado.
- Slug duplicado.
- Consulta de productos inexistentes.
- Actualización.
- Eliminación.

---

### ProductRepositoryTest

Utiliza un contenedor real de MongoDB mediante Testcontainers.

Se verifica:

- Almacenamiento de documentos.
- Generación automática del identificador.
- Búsqueda por SKU.
- Búsqueda por slug.
- Fechas de auditoría.
- Versionado del documento.

---

### ProductIntegrationTest

Realiza una prueba completa del flujo:

```text
HTTP
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
MongoDB
```

También valida que los productos sean almacenados realmente en MongoDB.

---

## Testcontainers

Las pruebas de persistencia e integración utilizan un contenedor MongoDB creado mediante Testcontainers.

La clase:

```text
AbstractMongoIntegrationTest
```

utiliza:

```java
MongoDBContainer
```

junto con:

```java
@ServiceConnection
```

para proporcionar automáticamente a Spring Boot la conexión a MongoDB durante las pruebas.

---

## Ejecución de pruebas

Como Maven se ejecutó mediante Docker, las pruebas pueden ejecutarse con:

```powershell
docker run --rm `
  -v "${PWD}:/workspace" `
  -w /workspace `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal `
  maven:3.9-eclipse-temurin-25 `
  mvn test
```

La ejecución finalizó correctamente con:

```text
BUILD SUCCESS
```

Las pruebas unitarias y de integración fueron completadas sin errores.

---

## Adaptaciones realizadas

A partir del ejemplo proporcionado por el docente para PostgreSQL se realizaron las siguientes modificaciones:

- Sustitución de PostgreSQL por MongoDB.
- Sustitución de Spring Data JPA por Spring Data MongoDB.
- Eliminación de Hibernate.
- Eliminación de Flyway.
- Eliminación de las migraciones SQL.
- Conversión de `Product` de entidad JPA a documento MongoDB.
- Uso de `@Document` para la colección `products`.
- Cambio de identificadores UUID a identificadores MongoDB representados mediante `String`.
- Generación automática del identificador por MongoDB.
- Sustitución de `JpaRepository` por `MongoRepository`.
- Eliminación de `JpaSpecificationExecutor`.
- Implementación de filtros mediante `MongoTemplate`, `Query` y `Criteria`.
- Configuración de índices únicos para SKU y slug.
- Uso de `Decimal128` para los precios.
- Habilitación de MongoDB Auditing.
- Configuración de MongoDB mediante Docker Compose.
- Implementación de un healthcheck para MongoDB.
- Adaptación de las pruebas unitarias.
- Adaptación de las pruebas de integración a MongoDB.
- Uso de `MongoDBContainer` con Testcontainers.
- Verificación directa de los documentos mediante `mongosh`.

---

## Diferencias principales respecto al ejemplo original

| Ejemplo original | Implementación de la práctica |
|---|---|
| PostgreSQL | MongoDB |
| Spring Data JPA | Spring Data MongoDB |
| `@Entity` | `@Document` |
| `JpaRepository` | `MongoRepository` |
| UUID | ObjectId representado como `String` |
| `Specification` | `MongoTemplate` + `Criteria` |
| Flyway | No requerido |
| Migraciones SQL | No requeridas |
| PostgreSQLContainer | MongoDBContainer |
| Tablas | Colecciones y documentos |

---

## Resultado

El Catalog Service funciona mediante una API REST desarrollada con Spring Boot y utiliza MongoDB como sistema de persistencia no relacional.

Se verificó correctamente:

- Levantamiento de MongoDB mediante Docker.
- Levantamiento del Catalog Service.
- Estado `UP` mediante Actuator.
- Creación de productos.
- Generación automática de identificadores.
- Consulta de productos.
- Persistencia directa en MongoDB.
- Paginación.
- Filtros de búsqueda.
- Validación de productos duplicados.
- Swagger.
- Pruebas unitarias.
- Pruebas de integración con Testcontainers.
- Ejecución final con `BUILD SUCCESS`.

---