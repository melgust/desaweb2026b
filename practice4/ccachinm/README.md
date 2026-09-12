# Microservicio de Catálogo - Laboratorio 2

Este es mi proyecto para el curso de Desarrollo Web de la Universidad Mariano Gálvez (UMG). Se trata de un microservicio de Catálogo de Productos desarrollado con **Spring Boot**, **Java 22** y **MongoDB**.

Anteriormente este proyecto utilizaba PostgreSQL y bases de datos relacionales, pero según lo requerido en la práctica, he realizado la migración completa a MongoDB (NoSQL) para mejorar la escalabilidad y manejar los documentos de manera más dinámica.

---

## 🚀 Tecnologías Utilizadas

- **Backend:** Java 22, Spring Boot 3.x
- **Persistencia:** Spring Data MongoDB (reemplazando a Spring Data JPA y Hibernate)
- **Base de Datos:** MongoDB corriendo en Docker
- **Pruebas:** JUnit 5, Mockito y Testcontainers (para levantar un contenedor de Mongo durante los tests)
- **Documentación:** Swagger UI (OpenAPI)

## 🛠️ Arquitectura y Patrones

El microservicio utiliza una arquitectura limpia en capas, muy típica en el desarrollo de software a nivel empresarial:
- **Controladores (`controller`):** Reciben las peticiones HTTP y manejan las respuestas.
- **Servicios (`service`):** Contienen toda la lógica de negocio (validaciones de SKU, reglas, filtros dinámicos con `MongoTemplate`).
- **Repositorios (`repository`):** Capa de persistencia usando `MongoRepository`.
- **DTOs y Mappers:** Usamos objetos de transferencia de datos para no exponer nuestras entidades (`Product.java`) directamente al cliente.

## ⚙️ Cómo ejecutar el proyecto

1. **Requisitos previos:**
   - Tener Docker y Docker Compose instalados.
   - Tener Java 22 configurado en las variables de entorno.
   - IDE como NetBeans, IntelliJ o Eclipse.

2. **Levantar la base de datos MongoDB:**
   Debes ejecutar el contenedor de MongoDB en segundo plano:
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

3. **Arrancar el microservicio:**
   Puedes darle "Play" al proyecto desde tu IDE, o bien, si usas la terminal, navega hasta la carpeta y compila con Maven:
   ```bash
   mvn clean spring-boot:run
   ```

4. **Probar los Endpoints:**
   La aplicación correrá en el puerto `8081` (lo cambié del 8080 para evitar conflictos con otras aplicaciones). 
   - Puedes ir a: `http://localhost:8081/swagger-ui.html` para ver la documentación de la API y probar los diferentes métodos (GET, POST, PUT, DELETE).

## 🧪 Pruebas Automatizadas

Todo el código está respaldado por pruebas de integración y unitarias. Lo más interesante aquí es que utilizo **Testcontainers**; esto significa que cuando se corren las pruebas, Java automáticamente levanta un contenedor de MongoDB temporal, hace las pruebas y luego lo destruye. ¡Nada de usar bases de datos locales sucias para probar!

```bash
mvn test
```

## 📝 Notas del Estudiante
- Se eliminó Flyway ya que MongoDB es schema-less y no requiere migraciones relacionales.
- La función de búsqueda dinámica que antes usaba `Specification` (SQL) fue reprogramada desde cero utilizando `MongoTemplate` y `Criteria` para construir los JSON de búsqueda en la base de datos.
- También dejé descargadas las imágenes de `redis` y `node` usando `docker pull` como preparación para la siguiente práctica del curso.
