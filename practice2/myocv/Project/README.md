# API REST de Personas (PHP puro)

API REST desarrollada en **PHP puro** (sin frameworks), que almacena la información
en un archivo **JSON** (`data/persons.json`), sin usar base de datos.


## Cómo ejecutarlo (sin Docker)

Usar la ubicación de xampp de forma explicita
  C:\xampp\php\php.exe -S localhost:8000

o usar la siguiente linea de comando donde esta ubicado index.php, si ya se tiene configurado el path con la ruta de xampp:
php -S localhost:8000 api/index.php


La API queda disponible en `http://localhost:8000`.


## Cómo ejecutarlo con Docker


docker build -t persons_api .
docker run -p 8000:8000 respons_api

## Endpoints

| Método | Endpoint                  | Descripción                   |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/persons`             | Crear una persona             |
| GET    | `/api/persons`             | Obtener todas las personas    |
| GET    | `/api/persons/{id}`        | Obtener una persona por ID    |
| PUT    | `/api/persons/{id}`        | Actualizar una persona        |
| DELETE | `/api/persons/{id}`        | Eliminar una persona          |
| GET    | `/api/persons/{id}/age`    | Obtener la edad de una persona|

El campo `birthday` debe enviarse en formato `YYYY-MM-DD`.

## Ejemplos con curl

## Ejemplos con curl

**Crear una persona**
```bash
curl -X POST http://localhost:8000/api/persons -H "Content-Type: application/json" -d "{\"name\":\"Ana López\",\"birthday\":\"1995-04-12\",\"email\":\"ana@example.com\"}"
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
curl -X PUT http://localhost:8000/api/persons/1 -H "Content-Type: application/json" -d "{\"name\":\"Ana López\",\"birthday\":\"1995-04-12\",\"email\":\"ana@example.com\"}"
```

**Eliminar una persona**
```bash
curl -X DELETE http://localhost:8000/api/persons/1
```

**Obtener la edad de una persona**
```bash
curl http://localhost:8000/api/persons/1/age



DTO (Data Transfer Object)

Un DTO es un objeto cuyo único propósito es transportar datos entre distintas capas de una aplicación, sin contener lógica de negocio. En la solución, PersonDTO representa la información de una persona (id, name, birthday, email) y se usa como el formato estándar en el que viaja esa información: se construye a partir de los datos que llegan en el body de la petición HTTP, y se convierte de vuelta a arreglo (toArray()) tanto para guardarlo en el JSON como para devolverlo en la respuesta de la API.

Controller

El Controller es el componente que recibe las solicitudes HTTP, decide qué operación de negocio ejecutar y coordina la interacción entre las demás capas (DTO y Helper), devolviendo finalmente una respuesta. En este proyecto, PersonController implementa cada operación del CRUD (create, getAll, getById, update, delete) y el cálculo de edad (getAge): valida los datos de entrada, construye o consulta los PersonDTO, delega la persistencia al FileManager, y arma la respuesta JSON con el código de estado HTTP correspondiente (200, 201, 400, 404, 500). El router (api/index.php) se limita a interpretar la URL/método y llamar al método correcto del controller.

Helper

Un Helper encapsula una responsabilidad técnica específica y reutilizable, separada de la lógica de negocio, para que otras clases no tengan que preocuparse por esos detalles de implementación. En la solución, FileManager cumple ese rol: se encarga exclusivamente de leer y escribir el archivo persons.json (incluyendo bloqueo de archivo con flock para evitar condiciones de carrera) y de generar el siguiente ID autoincremental. Gracias a esta separación, el PersonController no necesita saber cómo ni dónde se guardan los datos —solo le pide al FileManager que lea o escriba— lo que hace el código más limpio y más fácil de mantener o de cambiar.