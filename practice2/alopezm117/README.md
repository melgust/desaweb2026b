# API REST de Personas — PHP puro

Práctica 2 — Desarrollo Web
Astrid López (alopezm117)

API REST para gestionar información de personas, construida con PHP puro (sin frameworks), almacenando los datos en un archivo JSON (`data/persons.json`).

## Estructura del proyecto

```
alopezm117/
├── api/
│   └── index.php              # Router: recibe la petición HTTP y llama al Controller
├── controllers/
│   └── PersonController.php   # Lógica de negocio y validaciones
├── dto/
│   └── PersonDTO.php          # Data Transfer Object de una persona
├── helpers/
│   └── FileManager.php        # Lectura/escritura del archivo JSON
├── data/
│   └── persons.json           # "Base de datos" en archivo JSON
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Cómo ejecutar el proyecto

### Opción 1: con el servidor embebido de PHP (para desarrollo)

Requiere PHP 8 o superior instalado.

```bash
cd alopezm117
php -S localhost:8000 api/index.php
```

La API queda disponible en `http://localhost:8000`.

### Opción 2: con Docker (recomendado, cumple el requisito de contenedor)

Requiere Docker Desktop instalado y corriendo.

```bash
cd alopezm117
docker compose up --build
```

La API queda disponible en `http://localhost:8000`. Para detenerla:

```bash
docker compose down
```

## DTO, Controller y Helper: qué son y cómo se usaron aquí

**DTO (Data Transfer Object).** Un DTO es un objeto cuya única responsabilidad es transportar datos entre las distintas capas de una aplicación, sin contener lógica de negocio ni comportamiento más allá de exponer y convertir esos datos. Separar la transferencia de datos de la lógica de negocio trae varias ventajas: el objeto se vuelve fácil de entender y probar, controla explícitamente qué información entra y sale de la aplicación, y evita que las reglas de validación o persistencia queden mezcladas con la simple representación de un dato. En este proyecto, `PersonDTO` representa una persona (`id`, `name`, `birthday`, `email`), con sus getters, setters y un método `toArray()` que lo convierte en el arreglo asociativo que se guarda en el JSON o se devuelve como respuesta.

**Controller.** El Controller es responsable de recibir las solicitudes (en este caso, HTTP), coordinar qué operación debe ejecutarse y devolver una respuesta, pero **no** debería encargarse de detalles de bajo nivel como leer archivos directamente o imprimir la salida final. En esta API, `PersonController` recibe los datos ya parseados desde el router (`api/index.php`), aplica las validaciones (campos obligatorios, formato de correo, correo duplicado, formato y coherencia de la fecha de nacimiento), arma el `PersonDTO` correspondiente, le pide al `FileManager` que persista los cambios, y devuelve un arreglo con el código de estado HTTP y el cuerpo de la respuesta — sin saber nada de cómo se envía esa respuesta al navegador.

**Helper.** Un helper es una clase de apoyo que encapsula una funcionalidad puntual y reutilizable, generalmente sin estado de negocio propio, para que el resto del código no tenga que repetir esa lógica ni conocer sus detalles internos. Es recomendable usarlo cuando una tarea (como leer/escribir un archivo, formatear texto o hacer cálculos auxiliares) se necesita en varios lugares y conviene aislarla para facilitar su mantenimiento. Aquí, `FileManager` encapsula toda la interacción con `persons.json`: crear el archivo si no existe, leer todos los registros, sobreescribirlos y calcular el siguiente id disponible. Ni el Controller ni el DTO necesitan saber que la persistencia es un archivo JSON — si mañana cambiara el mecanismo de almacenamiento, solo habría que modificar este Helper.

## Endpoints disponibles

| Método | Endpoint                  | Descripción                    |
|--------|----------------------------|---------------------------------|
| POST   | /api/persons               | Crear una persona               |
| GET    | /api/persons                | Obtener todas las personas      |
| GET    | /api/persons/{id}           | Obtener una persona por ID      |
| PUT    | /api/persons/{id}           | Actualizar una persona          |
| DELETE | /api/persons/{id}           | Eliminar una persona            |
| GET    | /api/persons/{id}/age       | Obtener la edad de una persona  |

## Cómo probar los endpoints (curl)

> Nota para Windows/PowerShell: usa `curl.exe` (no `curl` a secas) y, para los cuerpos JSON, guárdalos en un archivo y referencia con `-d "@archivo.json"` para evitar problemas con el escapado de comillas de PowerShell.

**Obtener todas las personas**
```bash
curl http://localhost:8000/api/persons
```

**Obtener una persona por id**
```bash
curl http://localhost:8000/api/persons/1
```

**Crear una persona**
```bash
curl -X POST http://localhost:8000/api/persons \
  -H "Content-Type: application/json" \
  -d '{"name":"Astrid Lopez","birthday":"2003-05-10","email":"astrid@email.com"}'
```

**Obtener la edad de una persona**
```bash
curl http://localhost:8000/api/persons/1/age
```

**Actualizar una persona**
```bash
curl -X PUT http://localhost:8000/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Perez Actualizado","birthday":"1998-06-15","email":"juan@email.com"}'
```

**Eliminar una persona**
```bash
curl -X DELETE http://localhost:8000/api/persons/2
```

## Validaciones implementadas

- Todos los campos (`name`, `birthday`, `email`) son obligatorios.
- El nombre no puede estar vacío (ni solo espacios en blanco).
- El correo debe tener un formato válido.
- No se permiten correos duplicados entre personas distintas.
- La fecha de nacimiento debe tener el formato `YYYY-MM-DD`.
- La fecha de nacimiento no puede ser una fecha futura.
- Todas las respuestas se devuelven en formato JSON, con el código HTTP correspondiente (200, 201, 400, 404, 405).
