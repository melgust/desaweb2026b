# Práctica 2 - API REST con PHP

## Descripción

Esta práctica consiste en el desarrollo de una API REST utilizando PHP puro y Programación Orientada a Objetos (POO). La información de las personas se almacena en un archivo JSON, sin utilizar una base de datos. La API permite crear, consultar, actualizar y eliminar personas, además de obtener su edad a partir de la fecha de nacimiento.

---

# Requisitos

- PHP 8 o superior
- Docker y Docker Compose (opcional para ejecutar mediante contenedores)

---

# Ejecución del proyecto

## Opción 1: PHP

Desde la carpeta del proyecto ejecutar:

```bash
php -S localhost:8000 router.php
```

Luego acceder a la API mediante:

```
http://localhost:8000/api/persons
```

## Opción 2: Docker

Construir y ejecutar el contenedor:

```bash
docker compose up --build
```

La API quedará disponible en:

```
http://localhost:8000/api/persons
```

---

# Explicación de la solución

## DTO (Data Transfer Object)

Un DTO es un objeto cuya finalidad es transportar información entre las diferentes capas de una aplicación sin contener lógica de negocio. En este proyecto se implementó la clase `PersonDTO`, la cual representa una persona mediante los atributos `id`, `nombre`, `dob` y `correo`. Además, cuenta con sus respectivos getters, setters y el método `toArray()`, utilizado para convertir el objeto en un arreglo antes de almacenarlo en el archivo JSON.

## Controller

El Controller es el encargado de recibir las solicitudes HTTP, validar la información enviada por el cliente y coordinar las operaciones necesarias para responder la petición. En esta práctica se implementó `PersonController`, responsable de gestionar las operaciones CRUD (crear, consultar, actualizar y eliminar personas), así como de comunicarse con el `FileManager` para almacenar o recuperar la información.

## Helper

Un Helper es una clase que encapsula funciones de apoyo para evitar repetir código. En este proyecto se implementó `FileManager`, cuya responsabilidad es administrar el archivo `persons.json`, realizando operaciones como leer la información, escribir los cambios, generar el siguiente ID disponible y buscar personas por su identificador.

---

# Endpoints

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | /api/persons | Obtener todas las personas |
| GET | /api/persons/{id} | Obtener una persona por ID |
| POST | /api/persons | Crear una persona |
| PATCH | /api/persons/{id} | Actualizar una persona |
| DELETE | /api/persons/{id} | Eliminar una persona |

---

# Comandos cURL

## Obtener todas las personas

```bash
curl -X GET http://localhost:8000/api/persons
```

---

## Obtener una persona por ID

```bash
curl -X GET http://localhost:8000/api/persons/1
```

---

## Crear una persona

```bash
curl -X POST http://localhost:8000/api/persons \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Juan Pérez\",\"dob\":\"1998-06-15\",\"correo\":\"juan@email.com\"}"
```

---

## Actualizar una persona

```bash
curl -X PATCH http://localhost:8000/api/persons/1 \
-H "Content-Type: application/json" \
-d "{\"correo\":\"nuevo@email.com\"}"
```

---

## Eliminar una persona

```bash
curl -X DELETE http://localhost:8000/api/persons/1
```
