# Práctica 2 - API REST Personas (PHP)

## Descripción
API REST desarrollada en PHP puro sin frameworks para la gestión de personas, utilizando un archivo JSON como mecanismo de persistencia.

---

## Conceptos Clave

### Data Transfer Object (DTO)
Un DTO es un objeto que transporta datos entre procesos para reducir el número de llamadas a un servicio o encapsular la estructura de los datos que se transfieren. En esta solución, `PersonDTO` encapsula la información de una persona (`id`, `name`, `birthday`, `email`), asegurando la integridad de los atributos mediante getters, setters y un método `toArray()` para estructurar la salida a JSON sin exponer la lógica de persistencia.

### Controller
El Controller actúa como intermediario entre las peticiones del usuario (HTTP) y la lógica de datos. Su responsabilidad principal es gestionar las solicitudes HTTP, aplicar validaciones sobre los datos recibidos y coordinar las respuestas utilizando los códigos HTTP apropiados (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`). No debe manipular directamente el sistema de archivos ni la persistencia.

### Helper
Un Helper es una clase auxiliar cuyo objetivo es encapsular tareas repetitivas o utilitarias específicas. En esta solución, `FileManager` actúa como Helper encapsulando las operaciones de lectura, escritura y generación de IDs del archivo `persons.json`, manteniendo aislada la manipulación de archivos del resto de la aplicación.

---

## Ejecución con Docker

Para levantar la API en un contenedor Docker, ejecuta en la terminal dentro de esta carpeta:

```bash
docker-compose up -d --build