# API REST de personas

API REST desarrollada con PHP puro para registrar y administrar personas. Los datos se almacenan en un archivo JSON y la aplicación se ejecuta con Apache dentro de un contenedor Docker.

## Tecnologías utilizadas

- PHP 8.3
- Apache HTTP Server
- JSON
- Docker
- Docker Compose

## Estructura del proyecto

```text
ealvizuresp5/
├── api/
│   └── index.php
├── controllers/
│   └── PersonController.php
├── dto/
│   └── PersonDTO.php
├── helpers/
│   └── FileManager.php
├── data/
│   └── persons.json
├── .htaccess
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Componentes principales

Un DTO (Data Transfer Object) es un objeto utilizado para representar y transportar datos entre componentes. `PersonDTO` define los campos `id`, `name`, `birthday` y `email`; además, permite convertir una persona en un arreglo mediante `toArray()` antes de almacenarla.

Un Controller coordina las solicitudes relacionadas con un recurso. `PersonController` implementa las operaciones para listar, buscar, crear, actualizar y eliminar personas, además de calcular la edad y aplicar las validaciones correspondientes.

Un Helper encapsula una tarea auxiliar que puede reutilizarse sin mezclarla con la lógica de negocio. `FileManager` se encarga exclusivamente de crear, leer y escribir el archivo `data/persons.json`.

## Ejecución con Docker

Construir e iniciar el contenedor:

```powershell
docker compose up --build -d
```

Verificar su estado:

```powershell
docker compose ps
```

Consultar los registros:

```powershell
docker compose logs
```

Detener el servicio:

```powershell
docker compose down
```

Dirección base:

```text
http://localhost:8080
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/persons` | Crear una persona |
| GET | `/api/persons` | Listar todas las personas |
| GET | `/api/persons/{id}` | Consultar una persona por ID |
| PUT | `/api/persons/{id}` | Actualizar una persona |
| DELETE | `/api/persons/{id}` | Eliminar una persona |
| GET | `/api/persons/{id}/age` | Calcular la edad de una persona |

## Pruebas con curl.exe en PowerShell

Crear una persona:

```powershell
@'
{
  "name": "Juan Perez",
  "birthday": "1998-06-15",
  "email": "juan@email.com"
}
'@ | curl.exe -i -X POST "http://localhost:8080/api/persons" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@-"
```

Listar todas las personas:

```powershell
curl.exe "http://localhost:8080/api/persons"
```

Consultar la persona con ID 1:

```powershell
curl.exe "http://localhost:8080/api/persons/1"
```

Actualizar la persona con ID 1:

```powershell
@'
{
  "name": "Juan Perez Actualizado",
  "birthday": "1998-06-15",
  "email": "juan.actualizado@email.com"
}
'@ | curl.exe -i -X PUT "http://localhost:8080/api/persons/1" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@-"
```

Eliminar la persona con ID 1:

```powershell
curl.exe -X DELETE "http://localhost:8080/api/persons/1"
```

Consultar la edad de la persona con ID 1:

```powershell
curl.exe "http://localhost:8080/api/persons/1/age"
```

## Comprobación de validaciones

Enviar un correo con formato inválido:

```powershell
@'
{
  "name": "Ana Lopez",
  "birthday": "2000-04-20",
  "email": "correo-invalido"
}
'@ | curl.exe -i -X POST "http://localhost:8080/api/persons" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@-"
```

Comprobar un correo duplicado después de crear el ejemplo de Juan Pérez:

```powershell
@'
{
  "name": "Otra persona",
  "birthday": "2001-08-10",
  "email": "JUAN@EMAIL.COM"
}
'@ | curl.exe -i -X POST "http://localhost:8080/api/persons" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@-"
```

Enviar una fecha futura:

```powershell
@'
{
  "name": "Persona futura",
  "birthday": "2999-01-01",
  "email": "futuro@email.com"
}
'@ | curl.exe -i -X POST "http://localhost:8080/api/persons" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@-"
```

Consultar una persona inexistente:

```powershell
curl.exe "http://localhost:8080/api/persons/9999"
```
