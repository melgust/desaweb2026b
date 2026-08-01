# API REST - Gestión de Personas

## Requisitos

- Docker Desktop
- Git
- Docker Compose

---

## Instrucciones para ejecutar el proyecto

1. Abrir una terminal en la carpeta `practice2/dzacariasd1`.
2. Ejecutar el siguiente comando para construir y levantar el contenedor:

```bash
docker compose up --build
```

3. Cuando el contenedor esté en ejecución, la API estará disponible en:

```
http://localhost:8080/api/index.php
```

---

## Explicación de la solución

### ¿Qué es un DTO?

Un DTO (Data Transfer Object) es un objeto cuya función es transportar datos entre las diferentes capas de una aplicación sin incluir lógica de negocio. Su objetivo es organizar la información y facilitar su transferencia de una manera estructurada.

En este proyecto se implementó la clase **PersonDTO**, la cual representa a una persona mediante los atributos **id**, **name**, **birthday** y **email**. Además, incluye un constructor, métodos *getters* y *setters*, así como el método **toArray()**, utilizado para convertir el objeto en un arreglo antes de almacenarlo en el archivo JSON.

---

### ¿Qué es un Controller?

Un Controller es el encargado de recibir las solicitudes HTTP, procesarlas y coordinar las operaciones necesarias para responder al cliente. También se encarga de validar la información recibida y decidir qué acciones ejecutar.

En esta práctica se utilizó la clase **PersonController**, responsable de administrar todas las operaciones de la API, como crear, consultar, actualizar y eliminar personas, además de calcular la edad utilizando la fecha de nacimiento. También realiza las validaciones solicitadas, como verificar que los datos sean obligatorios, que el correo tenga un formato válido y que no existan correos duplicados.

---

### ¿Qué es un Helper?

Un Helper es una clase que agrupa funciones auxiliares para evitar repetir código y mantener una mejor organización del proyecto.

En esta solución se implementó la clase **FileManager**, cuya responsabilidad es administrar el archivo **persons.json**. Esta clase se encarga de leer, guardar, buscar, actualizar y eliminar registros dentro del archivo JSON, permitiendo separar la lógica de almacenamiento de la lógica del controlador.

---

## Comandos curl para probar la API

### Obtener todas las personas

```bash
curl http://localhost:8080/api/index.php/persons
```

### Crear una persona

```bash
curl -X POST http://localhost:8080/api/index.php/persons \
-H "Content-Type: application/json" \
-d "{\"name\":\"Dalila Zacarias\",\"birthday\":\"1998-06-23\",\"email\":\"lily@email.com\"}"
```

### Obtener una persona por ID

```bash
curl http://localhost:8080/api/index.php/persons/1
```

### Actualizar una persona

```bash
curl -X PUT http://localhost:8080/api/index.php/persons/1 \
-H "Content-Type: application/json" \
-d "{\"name\":\"Dalila de Leon\",\"birthday\":\"1998-06-23\",\"email\":\"lily@email.com\"}"
```

### Eliminar una persona

```bash
curl -X DELETE http://localhost:8080/api/index.php/persons/1
```

### Obtener la edad de una persona

```bash
curl http://localhost:8080/api/index.php/persons/1/age
```

---

## Tecnologías utilizadas

- PHP 8
- Docker
- Docker Compose
- Programación Orientada a Objetos (POO)
- JSON como almacenamiento de datos
- API REST