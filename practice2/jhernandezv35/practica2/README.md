# API REST de Personas — PHP puro + almacenamiento en JSON

API REST desarrollada en **PHP 8 puro** (sin frameworks, sin base de datos) para gestionar
información de personas, persistida en el archivo `data/persons.json`.

## Estructura del proyecto

```
project/
├── api/
│   └── index.php              # Front controller / router
├── controllers/
│   └── PersonController.php   # Lógica de las solicitudes HTTP
├── dto/
│   └── PersonDTO.php          # Data Transfer Object de Persona
├── helpers/
│   └── FileManager.php        # Lectura/escritura del archivo JSON
├── data/
│   └── persons.json           # Almacenamiento
├── Dockerfile
├── .dockerignore
└── README.md
```

## Cómo ejecutar el proyecto

### Opción 1: Docker (recomendado)

```bash
docker build -t persons-api .
docker run -p 8000:8000 persons-api
```

La API quedará disponible en `http://localhost:8000/api/persons`.

### Opción 2: Servidor embebido de PHP (sin Docker)

Requiere PHP 8 o superior instalado.

```bash
php -S 0.0.0.0:8000 -t api api/index.php
```

## DTO, Controller y Helper: qué son y cómo se usaron

**DTO (Data Transfer Object).** Un DTO es un objeto cuyo único propósito es transportar
datos entre capas de la aplicación, sin contener lógica de negocio. Separar la
transferencia de datos de la lógica de negocio tiene ventajas claras: define un
"contrato" explícito de qué información viaja entre capas, evita exponer directamente
las estructuras internas de almacenamiento, y facilita cambiar la fuente de datos (por
ejemplo, pasar de JSON a una base de datos) sin afectar a quien consume el DTO. En este
proyecto, `PersonDTO` representa a una persona con sus atributos (`id`, `name`,
`birthday`, `email`), expone getters/setters y un método `toArray()` que se usa para
serializar el objeto antes de guardarlo en `persons.json` o devolverlo como respuesta
JSON.

**Controller.** El controlador es responsable de recibir la solicitud HTTP, coordinar
qué operación debe ejecutarse y construir la respuesta con el código de estado
correspondiente; no debe encargarse de leer o escribir archivos ni de otras
responsabilidades ajenas al flujo de la petición. En este proyecto, `api/index.php`
actúa como router: interpreta el método HTTP y la URL, y delega la operación a
`PersonController`, que valida la entrada, arma los `PersonDTO` y decide qué código
HTTP (`200`, `201`, `400`, `404`) devolver en cada caso.

**Helper.** Un helper es una clase de utilidad que encapsula una responsabilidad
puntual y reutilizable, para no repetir esa lógica en distintos lugares del código.
Suele usarse para tareas transversales como manejo de archivos, formateo de fechas,
validaciones genéricas, etc. Aquí, `FileManager` es el helper encargado exclusivamente
de leer y escribir `persons.json` (incluyendo la generación del siguiente `id`), de
modo que ni el controlador ni el DTO necesitan saber cómo se persisten los datos.

## Endpoints

| Método | Endpoint                  | Descripción                  |
|--------|----------------------------|-------------------------------|
| POST   | `/api/persons`             | Crear una persona             |
| GET    | `/api/persons`             | Obtener todas las personas    |
| GET    | `/api/persons/{id}`        | Obtener una persona por ID    |
| PUT    | `/api/persons/{id}`        | Actualizar una persona        |
| DELETE | `/api/persons/{id}`        | Eliminar una persona          |
| GET    | `/api/persons/{id}/age`    | Obtener la edad de una persona|

## Validaciones implementadas

- Todos los campos (`name`, `birthday`, `email`) son obligatorios.
- El nombre no puede estar vacío.
- El correo debe tener un formato válido.
- No se permiten correos duplicados.
- La fecha de nacimiento debe tener el formato `YYYY-MM-DD`.
- La fecha de nacimiento no puede ser una fecha futura.
- Todas las respuestas se devuelven en formato JSON, con el código HTTP apropiado.

## Comandos curl para probar los endpoints

**Crear una persona**
```bash
curl -X POST http://localhost:8000/api/persons \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","birthday":"1998-06-15","email":"juan@email.com"}'
```

**Obtener todas las personas**
```bash
curl http://localhost:8000/api/persons
```

**Obtener una persona por ID**
```bash
curl http://localhost:8000/api/persons/1
```

**Actualizar una persona**
```bash
curl -X PUT http://localhost:8000/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","birthday":"1998-06-15","email":"juan.perez@email.com"}'
```

**Eliminar una persona**
```bash
curl -X DELETE http://localhost:8000/api/persons/1
```

**Obtener la edad de una persona**
```bash
curl http://localhost:8000/api/persons/1/age
```

## Notas

- La edad **no se almacena** en `persons.json`; se calcula dinámicamente en cada
  solicitud a `/api/persons/{id}/age` utilizando `DateTime`.
- El archivo `data/persons.json` inicia como un arreglo vacío (`[]`) y se actualiza
  en cada operación de creación, actualización o eliminación.
