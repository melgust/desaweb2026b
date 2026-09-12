# Práctica 2 - API REST con PHP

## Autor

**Usuario UMG:** jpintog3

---

# Descripción

Este proyecto consiste en el desarrollo de una API REST utilizando PHP 8 y Programación Orientada a Objetos (POO). La API permite administrar información de personas mediante operaciones CRUD (Crear, Consultar, Actualizar y Eliminar), utilizando un archivo JSON como mecanismo de almacenamiento, sin emplear una base de datos.

La aplicación implementa los métodos HTTP **GET**, **POST**, **PUT** y **DELETE**, además de un endpoint para calcular la edad de una persona a partir de su fecha de nacimiento utilizando la clase `DateTime`.

---

# Estructura del proyecto

```text
jpintog3/
│
├── Dockerfile
├── docker-compose.yml
├── README.md
│
├── api/
│   └── index.php
│
├── controllers/
│   └── PersonController.php
│
├── dto/
│   └── PersonDTO.php
│
├── helpers/
│   └── FileManager.php
│
├── data/
│   └── persons.json
│
└── .htaccess
```

---

# Requisitos

* Docker Desktop
* Docker Compose
* Puerto 8080 disponible

---

# Ejecución del proyecto

1. Abrir una terminal en la carpeta del proyecto.

2. Construir e iniciar el contenedor.

```bash
docker compose up --build
```

3. Abrir el navegador.

```
http://localhost:8080
```

o

```
http://localhost:8080/api/index.php
```

dependiendo de la configuración del servidor Apache.

---

# Explicación de la solución

## DTO (Data Transfer Object)

Un DTO (Data Transfer Object) es un objeto cuya finalidad es transportar datos entre las diferentes capas de una aplicación sin incluir lógica de negocio. Su principal ventaja es mantener una separación clara entre la información que se manipula y la lógica encargada de procesarla, facilitando el mantenimiento y la reutilización del código.

En este proyecto se implementó la clase **PersonDTO**, la cual representa a una persona mediante los atributos **id**, **name**, **birthday** y **email**. Esta clase incluye constructor, getters, setters y el método **toArray()**, utilizado para convertir el objeto en un arreglo antes de almacenarlo en el archivo JSON.

---

## Controller

El Controller es el componente encargado de recibir las solicitudes HTTP, procesarlas y coordinar las acciones necesarias para generar una respuesta. Su responsabilidad es controlar el flujo de la aplicación, realizando las validaciones correspondientes y comunicándose con las demás clases sin encargarse directamente del almacenamiento de la información.

En esta práctica se implementó **PersonController**, donde se desarrollaron los endpoints para crear, consultar, actualizar, eliminar personas y calcular la edad de una persona utilizando su fecha de nacimiento.

---

## Helper

Un Helper es una clase auxiliar que encapsula funcionalidades reutilizables para evitar duplicar código dentro de la aplicación. Generalmente contiene operaciones de apoyo que pueden ser utilizadas desde distintos componentes del sistema.

En este proyecto se implementó **FileManager** como Helper para centralizar las operaciones de lectura y escritura del archivo **persons.json**, permitiendo que el controlador únicamente se enfoque en la lógica de negocio mientras que el Helper administra la persistencia de los datos.

---

# Endpoints disponibles

| Método | Endpoint              | Descripción                |
| ------ | --------------------- | -------------------------- |
| GET    | /api/persons          | Obtener todas las personas |
| GET    | /api/persons/{id}     | Obtener una persona        |
| POST   | /api/persons          | Crear una persona          |
| PUT    | /api/persons/{id}     | Actualizar una persona     |
| DELETE | /api/persons/{id}     | Eliminar una persona       |
| GET    | /api/persons/{id}/age | Obtener la edad            |

---

# Comandos curl

## Obtener todas las personas

```bash
curl -X GET http://localhost:8080/api/persons
```

---

## Obtener una persona por ID

```bash
curl -X GET http://localhost:8080/api/persons/1
```

---

## Crear una persona

```bash
curl -X POST http://localhost:8080/api/persons \
-H "Content-Type: application/json" \
-d "{\"name\":\"Juan Pérez\",\"birthday\":\"1998-06-15\",\"email\":\"juan@email.com\"}"
```

---

## Actualizar una persona

```bash
curl -X PUT http://localhost:8080/api/persons/1 \
-H "Content-Type: application/json" \
-d "{\"name\":\"Juan Carlos\",\"birthday\":\"1998-06-15\",\"email\":\"juancarlos@email.com\"}"
```

---

## Eliminar una persona

```bash
curl -X DELETE http://localhost:8080/api/persons/1
```

---

## Obtener la edad de una persona

```bash
curl -X GET http://localhost:8080/api/persons/1/age
```

---

# Archivo de almacenamiento

Toda la información se almacena en:

```
data/persons.json
```

Inicialmente el archivo contiene:

```json
[]
```
