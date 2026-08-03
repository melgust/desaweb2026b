# Práctica 3 - API RESTful de Gestión de Personas

**Usuario:** Isaías Morales Illescas  
**Curso:** Desarrollo Web  

---

##  Descripción del Proyecto

API RESTful desarrollada en PHP puro orientada a objetos (sin frameworks), encargada de la gestión e interacción con el recurso `Person`. La información se persiste localmente en formato JSON dentro del archivo `data/persons.json`.

---

##  Arquitectura y Patron de Diseño

En esta solución se implementó una arquitectura limpia separando las responsabilidades en componentes clave:

* **DTO (Data Transfer Object):** La clase `PersonDTO` define la estructura del objeto de datos `Person` y centraliza todas las reglas de validación de entrada (campos obligatorios, formato de correo electrónico y validación de fechas futuras). Permite transformar los datos recibidos desde las peticiones HTTP en un modelo seguro y estructurado antes de interactuar con la lógica del sistema.
* **Controller:** La clase `PersonController` actúa como la capa intermedia que gestiona la lógica de negocio. Recibe las peticiones filtradas desde el enrutador (`index.php`), solicita validaciones al DTO, interactúa con el Helper de archivos para la persistencia y retorna las respuestas HTTP correspondientes con sus respectivos códigos de estado (200, 201, 400, 404, 405). Además, contiene la lógica para calcular dinámicamente la edad sin modificar la estructura persisitida.
* **Helper:** La clase `FileManager` es una utilidad encargada exclusivamente de la lectura y escritura de archivos en el sistema de disco. Aísla por completo el manejo del sistema de archivos (`persons.json`), asegurando que las demás capas no dependan directamente del almacenamiento.

---

##  Instrucciones para Ejecutar el Proyecto

### Opción 1: Con Docker (Recomendado)

1. Navegar a la carpeta del proyecto:
   ```bash
   cd practice3/imoralesi

2. Levantar el contenedor Docker: 
    ```bash
    docker-compose up -d --build

### COMANDOS cURL para probar los EndPoints
1. Crear una persona(POST)
curl -X POST http://localhost:8000/practice3/imoralesi/api/index.php/api/persons \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "birthday": "1998-05-15", "email": "juan.perez@example.com"}'
  
2. Obtener todas las Personas (GET)
curl -X GET http://localhost:8000/practice3/imoralesi/api/index.php/api/persons

3. Obtener Persona por ID (GET)
curl -X GET http://localhost:8000/practice3/imoralesi/api/index.php/api/persons/1

4. Calcular Edad Dinámica por ID (GET)
curl -X GET http://localhost:8000/practice3/imoralesi/api/index.php/api/persons/1/age

5. Actualizar Persona (PUT)
curl -X PUT http://localhost:8000/practice3/imoralesi/api/index.php/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Perez Actualizado", "birthday": "1998-05-15", "email": "perez@example.com"}'