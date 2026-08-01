# Práctica 2: API REST con PHP puro y almacenamiento en archivos JSON

## Descripción
Esta API REST permite gestionar la información de personas utilizando PHP 8+ estructurado bajo programación orientada a objetos (POO), siguiendo patrones de arquitectura limpia mediante **DTO**, **Controller** y **Helper**, con almacenamiento en un archivo `persons.json` sin el uso de bases de datos o frameworks.

---

## Explicación de Conceptos de Arquitectura

### 1. Data Transfer Object (DTO)
Un **DTO (Data Transfer Object)** es un objeto diseñado para encapsular datos y transportarlos entre diferentes capas de una aplicación sin incluir lógica de negocio compleja. Su propósito principal es definir un contrato de datos estricto e inmutable, facilitando el desacoplamiento y mejorando la mantenibilidad. Las ventajas principales de separar la transferencia de datos de la lógica de negocio radican en prevenir la exposición no deseada de modelos internos, garantizar tipado estricto en la estructura de transporte y simplificar la serialización/deserialización de datos. En esta solución, la clase `PersonDTO` (`dto/PersonDTO.php`) actúa como la representación oficial de los atributos de una persona (`id`, `name`, `birthday`, `email`) y expone un método `toArray()` para convertir el objeto a la estructura asociativa en JSON.

### 2. Controller
El **Controller (Controlador)** es la capa intermedia encargada de recibir e interpretar las solicitudes HTTP entrantes, coordinar la ejecución con la lógica de negocio y Helpers de persistencia, y construir la respuesta HTTP adecuada (cuerpos JSON y códigos de estado HTTP como 200, 201, 400, 404). Su responsabilidad debe limitarse a la orquestación del flujo de la solicitud, validaciones de entrada y delegación de operaciones; **no debe** encargarse de acceder directamente a archivos ni realizar manipulación directa de disco. En nuestra implementación, `PersonController` (`controllers/PersonController.php`) gestiona todas las operaciones de los endpoints (`getAll`, `getById`, `create`, `update`, `delete`, `getAge`), valida campos obligatorios, correos duplicados y fechas de nacimiento, y delega la lectura/escritura de datos al Helper.

### 3. Helper
Un **Helper (Clase de asistencia/auxiliar)** es un componente diseñado para encapsular tareas secundarias o utilitarias repetitivas que no forman parte directa de la lógica de negocio o de presentación. Es recomendable utilizarlo para aislar operaciones de infraestructura como manipulación de archivos, formateo de datos, o cálculos auxiliares. En este proyecto, la clase `FileManager` (`helpers/FileManager.php`) actúa como un Helper especializado en operaciones de lectura, escritura con bloqueo exclusivo (`LOCK_EX`) y cálculo de IDs autonumérico sobre el archivo `data/persons.json`, aislando completamente la persistencia en disco de las capas superiores.

---

## Instrucciones para Ejecutar el Proyecto

### Opción A: Mediante Docker (Recomendado)

1. Construir y levantar el contenedor utilizando Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
2. La API estará disponible en la dirección:
   ```
   http://localhost:8080/api/persons
   ```
3. Para detener el contenedor:
   ```bash
   docker-compose down
   ```

### Opción B: Servidor Integrado de PHP (Desarrollo local)

1. Navegar a la carpeta del proyecto:
   ```bash
   cd practice2
   ```
2. Iniciar el servidor web integrado de PHP apuntando a la carpeta `api`:
   ```bash
   php -S localhost:8000 -t api
   ```
3. La API responderá en `http://localhost:8000/persons`.

---

## Guía de Uso de Endpoints (Comandos cURL)

### 1. Crear una persona
- **Método:** `POST`
- **Endpoint:** `/api/persons`
```bash
curl -X POST http://localhost:8080/api/persons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "birthday": "1998-06-15",
    "email": "juan@email.com"
  }'
```

### 2. Obtener todas las personas
- **Método:** `GET`
- **Endpoint:** `/api/persons`
```bash
curl -X GET http://localhost:8080/api/persons
```

### 3. Obtener una persona por ID
- **Método:** `GET`
- **Endpoint:** `/api/persons/1`
```bash
curl -X GET http://localhost:8080/api/persons/1
```

### 4. Actualizar una persona
- **Método:** `PUT`
- **Endpoint:** `/api/persons/1`
```bash
curl -X PUT http://localhost:8080/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez Modificado",
    "birthday": "1998-06-15",
    "email": "juan.nuevo@email.com"
  }'
```

### 5. Obtener la edad de una persona
- **Método:** `GET`
- **Endpoint:** `/api/persons/1/age`
```bash
curl -X GET http://localhost:8080/api/persons/1/age
```

### 6. Eliminar una persona
- **Método:** `DELETE`
- **Endpoint:** `/api/persons/1`
```bash
curl -X DELETE http://localhost:8080/api/persons/1
```
