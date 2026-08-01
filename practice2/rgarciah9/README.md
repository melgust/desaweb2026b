# API REST de Personas — PHP puro

API REST desarrollada en PHP 8 (sin frameworks), con almacenamiento en un archivo JSON (`data/persons.json`), siguiendo el patrón DTO / Controller / Helper.

## Cómo ejecutar el proyecto

### Con Docker (recomendado)

```bash
docker compose up --build
```

La API quedará disponible en: `http://localhost:8081/api/persons`

### Sin Docker (con PHP instalado localmente)

```bash
php -S localhost:8000 -t .
```

> Nota: al correr sin Docker, las rutas amigables (`/api/persons/1`) requieren Apache con `mod_rewrite` (ver `.htaccess`), por lo que se recomienda usar Docker para probar la API tal como está pensada.

## DTO, Controller y Helper

**DTO (Data Transfer Object):** es un objeto simple cuyo único propósito es transportar datos entre capas de la aplicación, sin contener lógica de negocio. En este proyecto, `PersonDTO` representa la información de una persona (id, name, birthday, email) y expone un método `toArray()` para convertirla en un arreglo asociativo listo para guardarse en JSON o responderse al cliente.

**Controller:** es responsable de recibir las solicitudes, coordinar las operaciones necesarias (validar, leer/escribir datos, calcular resultados) y devolver la respuesta adecuada — pero no debe encargarse de detalles de bajo nivel como leer archivos directamente. `PersonController` centraliza toda la lógica de negocio de la API: crear, listar, actualizar, eliminar personas, calcular la edad, y aplicar las validaciones, delegando el manejo del archivo JSON al Helper.

**Helper:** es una clase de utilidad que encapsula una funcionalidad técnica específica y reutilizable, sin lógica de negocio. `FileManager` se encarga únicamente de leer y escribir el archivo `persons.json`, sin saber nada sobre reglas de negocio como validaciones o cálculo de edad.

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/persons` | Crear una persona |
| GET | `/api/persons` | Obtener todas las personas |
| GET | `/api/persons/{id}` | Obtener una persona por ID |
| PUT | `/api/persons/{id}` | Actualizar una persona |
| DELETE | `/api/persons/{id}` | Eliminar una persona |
| GET | `/api/persons/{id}/age` | Obtener la edad de una persona |

## Pruebas con curl

**Crear una persona**
```bash
curl -X POST http://localhost:8081/api/persons \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Perez", "birthday": "1998-06-15", "email": "juan@email.com"}'
```

**Obtener todas las personas**
```bash
curl http://localhost:8081/api/persons
```

**Obtener una persona por ID**
```bash
curl http://localhost:8081/api/persons/1
```

**Actualizar una persona**
```bash
curl -X PUT http://localhost:8081/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Perez Actualizado", "birthday": "1998-06-15", "email": "juan.nuevo@email.com"}'
```

**Eliminar una persona**
```bash
curl -X DELETE http://localhost:8081/api/persons/1
```

**Obtener la edad de una persona**
```bash
curl http://localhost:8081/api/persons/1/age
```