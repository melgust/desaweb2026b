# API REST de Personas — PHP puro + JSON

API REST desarrollada en PHP 8 (sin frameworks) para gestionar información de personas, utilizando un archivo JSON como mecanismo de persistencia.

## Cómo ejecutar el proyecto

Requisitos: Docker y Docker Compose instalados.

```bash
# Desde la carpeta practice2/wramosc4
docker compose up --build
```

La API quedará disponible en:

```
http://localhost:8000/api/persons
```

Para detener el contenedor:

```bash
docker compose down
```

## DTO, Controller y Helper

Un **DTO (Data Transfer Object)** es un objeto simple cuyo único propósito es transportar datos entre capas de la aplicación, sin contener lógica de negocio. En este proyecto, `PersonDTO` representa la información de una persona (id, name, birthday, email) y ofrece un método `toArray()` para convertirse fácilmente en un formato compatible con JSON. Usar un DTO permite separar "cómo se ven los datos" de "cómo se procesan o se guardan", lo que facilita mantener el código y evita que la estructura interna de la aplicación se filtre directamente hacia las respuestas HTTP.

El **Controller** es responsable de coordinar las solicitudes HTTP: recibe el request, valida los datos de entrada, decide qué operación ejecutar y arma la respuesta con el código HTTP adecuado. Lo que un Controller *no* debe hacer es conocer los detalles técnicos de cómo se almacenan los datos (eso es tarea del Helper) ni mezclar reglas de presentación con lógica de persistencia. En este proyecto, `PersonController` centraliza toda la lógica de los endpoints de `/api/persons`.

Un **Helper** es una clase de utilidad que encapsula una funcionalidad específica y reutilizable, separada de la lógica principal del negocio. Se recomienda usarlo cuando una tarea (como leer/escribir archivos, formatear fechas, generar tokens, etc.) puede aislarse y reutilizarse desde distintos lugares sin depender del flujo de un Controller. Aquí, `FileManager` encapsula exclusivamente la lectura y escritura del archivo `persons.json`, de modo que si en el futuro cambiara el mecanismo de almacenamiento, solo habría que modificar esta clase.

## Endpoints y ejemplos con curl

### Crear una persona
```bash
curl -X POST http://localhost:8000/api/persons \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","birthday":"1998-06-15","email":"juan@email.com"}'
```

### Obtener todas las personas
```bash
curl http://localhost:8000/api/persons
```

### Obtener una persona por ID
```bash
curl http://localhost:8000/api/persons/1
```

### Actualizar una persona
```bash
curl -X PUT http://localhost:8000/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez Gómez","birthday":"1998-06-15","email":"juan.perez@email.com"}'
```

### Eliminar una persona
```bash
curl -X DELETE http://localhost:8000/api/persons/1
```

### Obtener la edad de una persona
```bash
curl http://localhost:8000/api/persons/1/age
```

## Estructura del proyecto

```
practice2/wramosc4/
├── api/
│   └── index.php          # Router / front controller
├── controllers/
│   └── PersonController.php
├── dto/
│   └── PersonDTO.php
├── helpers/
│   └── FileManager.php
├── data/
│   └── persons.json
├── router.php              # Router para el servidor embebido de PHP
├── Dockerfile
├── docker-compose.yml
└── README.md
```
