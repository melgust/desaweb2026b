# Práctica 3 — Paginación, Categorías y Facturación

**Usuario / Rama:** `dzacariasd1`
**Universidad Mariano Gálvez de Guatemala** — Desarrollo Web 2026-2

Aplicación full-stack basada en el ejemplo de la práctica 3 (`practice3/mcalic1`),
extendida para que el listado de productos ofrezca **dos estrategias de paginación**
que el usuario puede alternar desde la misma pantalla:

1. **Paginación por offset** — la clásica, con botones *Anterior / Siguiente*.
2. **Scroll infinito** — los productos se van cargando por bloques conforme el
   usuario baja en la página, usando `IntersectionObserver`.

Posteriormente se agregó la **tabla `Categorias`** relacionada con productos, con
su CRUD completo en backend y frontend, y filtrado de productos por categoría.

## Stack

| Capa       | Tecnología                                            |
|------------|-------------------------------------------------------|
| Frontend   | Angular 18 (standalone components + signals), Nginx   |
| Backend    | ASP.NET Core 10 Web API, EF Core 9 (Pomelo MySQL)     |
| Base datos | MySQL 8.0                                             |
| Seguridad  | JWT Bearer + BCrypt, autorización por roles           |

---

## Qué se modificó respecto al ejemplo

### Backend

| Archivo | Cambio |
|---------|--------|
| `Application/DTOs/ProductDtos.cs` | Nuevo `ProductScrollResult` con `Offset`, `Limit`, `TotalItems`, `NextOffset` y `HasMore`. |
| `Application/Services/ProductService.cs` | Se extrajo `BuildQuery()` (filtro + orden compartidos) y se agregó `GetProductsScrollAsync()`. También se agregó desempate por `Id` para que el orden sea estable, y límites máximos de página. |
| `Api/Controllers/ProductsController.cs` | Nuevo endpoint `GET /api/products/scroll`. |
| `Infrastructure/Data/DbSeeder.cs` | Se siembran **150 productos** de demostración: sin volumen suficiente no se puede apreciar ninguna de las dos paginaciones. |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `core/models/product.model.ts` | Nueva interfaz `ProductScrollResult`. |
| `core/services/product.service.ts` | Nuevo método `getProductsScroll()`. |
| `features/products/.../product-list.component.ts` | Selector de modo (`offset` \| `infinite`), carga incremental con `IntersectionObserver`, indicadores de carga y de fin de lista. |
| `features/products/.../product-list.component.html` | Botones de cambio de modo, resumen de resultados, centinela de scroll, spinner y botón *Cargar más* como alternativa accesible. |
| `features/products/.../product-list.component.css` | Estilos del selector, del spinner y de los estados del scroll. |
| `frontend/nginx.conf` (nuevo) | `try_files` para que recargar una ruta como `/products` no devuelva 404. |

---

## Cómo funciona cada paginación

### 1. Offset (`GET /api/products`)

```
GET /api/products?page=2&pageSize=10&sortBy=name&sortDirection=asc
```

El servidor traduce la página a `SKIP (page-1)*pageSize` / `TAKE pageSize` y
devuelve además `totalItems` y `totalPages`. El cliente **reemplaza** el
contenido de la tabla en cada cambio de página.

```json
{ "items": [ ... ], "totalItems": 150, "page": 2, "pageSize": 10, "totalPages": 15 }
```

### 2. Scroll infinito (`GET /api/products/scroll`)

```
GET /api/products/scroll?offset=24&limit=12&sortBy=name&sortDirection=asc
```

En lugar de un número de página se trabaja con un desplazamiento. La respuesta
le dice al cliente **desde dónde continuar** y **si quedan más registros**, que
es todo lo que necesita para seguir cargando solo:

```json
{ "items": [ ... ], "offset": 24, "limit": 12, "totalItems": 150, "nextOffset": 36, "hasMore": true }
```

En el navegador hay un elemento centinela invisible al final de la lista:

```html
<div #scrollAnchor class="scroll-anchor"></div>
```

Un `IntersectionObserver` con `rootMargin: '200px'` lo vigila y dispara la
siguiente carga **200 px antes** de que el usuario llegue al final, de modo que
el contenido nuevo aparece sin cortes. Los bloques se **concatenan** al arreglo
en lugar de reemplazarlo:

```ts
this.products.update(current => [...current, ...res.items]);
```

Detalles cuidados en la implementación:

- **Bloqueo de reentrada** (`loadingMore`): evita disparar dos peticiones para el
  mismo bloque si el observador se activa varias veces.
- **Relleno de pantalla** (`fillViewport`): si un bloque no alcanza a llenar la
  ventana, el centinela sigue visible y `IntersectionObserver` ya no vuelve a
  emitir (no hay transición). Por eso, tras cada carga se comprueba a mano si el
  centinela sigue dentro del área visible y, de ser así, se encadena la
  siguiente carga.
- **Orden estable**: la consulta ordena por el campo elegido y desempata por
  `Id`. Sin ese desempate, dos productos con el mismo nombre podrían repetirse
  o perderse al saltar de bloque.
- **Botón *Cargar más***: alternativa accesible para quien no use scroll (o para
  navegadores sin `IntersectionObserver`).
- **Buscar y ordenar reinician el listado** en ambos modos.
- `ngOnDestroy` desconecta el observador para no dejar fugas.

---

## Entrega 2: tabla Categorías

Relación **uno a muchos**: una categoría agrupa muchos productos.

### Modelo de datos

```
Categories                          Products
----------                          --------
Id            char(36)  PK   1 ──┐  Id           char(36)  PK
Name          varchar(80) UNIQUE│  ...
Description   longtext          └─N CategoryId   char(36)  FK NULL
IsActive      tinyint(1)           ...
CreatedAt     datetime(6)
UpdatedAt     datetime(6)
```

La clave foránea es **anulable** a propósito: los productos que ya existían antes
de crear la tabla siguen siendo válidos. La migración se aplica sin pérdida de
datos y el seeder los reasigna después según su nombre. En la interfaz, en cambio,
el campo sí es obligatorio al dar de alta o editar.

El borrado usa `DeleteBehavior.Restrict`: no se puede eliminar una categoría que
todavía agrupa productos. El backend lo comprueba antes y responde **409 Conflict**
con el motivo, en lugar de dejar que falle la restricción de MySQL.

### Backend

| Archivo | Cambio |
|---------|--------|
| `Domain/Entities/Category.cs` | Entidad nueva. |
| `Domain/Entities/Product.cs` | `CategoryId` (`Guid?`) y navegación `Category`. |
| `Infrastructure/Data/AppDbContext.cs` | `DbSet<Category>`, relación 1:N, índice único en `Name`. |
| `Infrastructure/Data/Migrations/…_AddCategories.cs` | Migración: crea `Categories`, agrega la columna, el índice y la FK. |
| `Infrastructure/Data/DbSeeder.cs` | Siembra 8 categorías y asigna una a cada producto según su nombre. |
| `Application/DTOs/CategoryDtos.cs` | DTOs, incluido `ProductCount`. |
| `Application/Services/CategoryService.cs` | CRUD, nombre único y bloqueo de borrado si hay productos. |
| `Application/Services/ProductService.cs` | Filtro `categoryId`, orden por categoría y `CategoryName` en la proyección. |
| `Api/Controllers/CategoriesController.cs` | Controlador nuevo con códigos 404 / 409. |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `core/models/category.model.ts` | Interfaz `Category`. |
| `core/services/category.service.ts` | Servicio con el CRUD. |
| `features/categories/…/category-list` | Listado con conteo de productos y borrado. |
| `features/categories/…/category-form` | Alta y edición. |
| `features/products/…/product-list` | Columna **Categoría** y desplegable de filtro. |
| `features/products/…/product-form` | Desplegable para elegir categoría. |
| `app.routes.ts` · `app.component.ts` | Rutas `/categories` y enlaces en la barra superior. |

### Endpoints de categorías

| Método | Endpoint                  | Roles           | Descripción                        |
|--------|---------------------------|-----------------|------------------------------------|
| GET    | `/api/categories`         | Todos           | Listar (`?onlyActive=true`)        |
| GET    | `/api/categories/{id}`    | Todos           | Obtener una                        |
| POST   | `/api/categories`         | Admin, Manager  | Crear (409 si el nombre se repite) |
| PUT    | `/api/categories/{id}`    | Admin, Manager  | Actualizar                         |
| DELETE | `/api/categories/{id}`    | Admin           | Eliminar (409 si tiene productos)  |

Los endpoints de productos aceptan además el parámetro `categoryId` para filtrar,
y `sortBy=category` para ordenar por nombre de categoría.

---

## Entrega 3: Proveedores, Clientes, Facturas y Detalle

Se completó el modelo de datos con las cuatro tablas restantes.

### Modelo relacional

```
Suppliers                Categories
    |1                       |1
    |                        |
    +----------N Products N--+
                   |1
                   |
                   N
              InvoiceDetails
                   N
                   |
                   |1
               Invoices
                   N
                   |
                   |1
                Clients
```

| Relación | Cardinalidad | Al eliminar el padre |
|----------|--------------|----------------------|
| `Supplier` → `Product` | 1 : N | `SetNull` — el producto se conserva sin proveedor |
| `Category` → `Product` | 1 : N | `Restrict` — hay que reasignar los productos primero |
| `Client` → `Invoice` | 1 : N | `Restrict` — no se borra un cliente con facturas |
| `Invoice` → `InvoiceDetail` | 1 : N | `Cascade` — los renglones no existen sin su factura |
| `Product` → `InvoiceDetail` | 1 : N | `Restrict` — no se borra un producto ya facturado |

Cada comportamiento responde a una regla distinta: el proveedor es un dato de
contacto que se puede perder, pero una factura emitida no se puede alterar.

### Reglas de negocio de la facturación

- El correlativo (`FAC-000001`) lo genera el servidor; la columna tiene índice único.
- **Los precios no vienen del navegador.** La petición solo lleva el cliente y
  pares producto/cantidad; el servidor lee el precio vigente de la base y calcula
  subtotal, IVA (12%) y total. Así no se puede manipular el importe desde el cliente.
- Se valida **todo** el stock antes de descontar nada, para no dejar una factura a
  medio emitir.
- Emitir descuenta inventario; **anular lo devuelve**.
- El renglón guarda el nombre y el precio del producto al momento de facturar, de
  modo que un cambio de precio posterior no altera facturas ya emitidas.
- No se factura a un cliente inactivo.
- Un mismo producto repetido en dos renglones se acumula en uno solo.

### Endpoints nuevos

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/api/suppliers` | Todos | Listar (`?onlyActive=true`) |
| POST · PUT | `/api/suppliers[/{id}]` | Admin, Manager | Crear / actualizar |
| DELETE | `/api/suppliers/{id}` | Admin | Eliminar |
| GET | `/api/clients` | Todos | Listar (`?onlyActive=true`) |
| POST · PUT | `/api/clients[/{id}]` | Admin, Manager | Crear / actualizar (409 si el NIT se repite) |
| DELETE | `/api/clients/{id}` | Admin | Eliminar (409 si tiene facturas) |
| GET | `/api/invoices` | Todos | Listado paginado (`search`, `clientId`) |
| GET | `/api/invoices/{id}` | Todos | Factura con sus renglones |
| POST | `/api/invoices` | Admin, Manager | Emitir (409 si falta stock) |
| DELETE | `/api/invoices/{id}` | Admin | Anular y devolver stock |

Los endpoints de productos aceptan además `supplierId` para filtrar y
`sortBy=supplier` para ordenar.

### Pantallas nuevas

`/suppliers`, `/clients`, `/invoices` (listado), `/invoices/new` (armado de la
factura con sus renglones y totales en vivo) y `/invoices/:id` (documento emitido).

---

## Cómo ejecutar

### Con Docker (recomendado)

```bash
cd practice3/dzacariasd1
docker compose up -d --build
```

| Servicio | URL                       |
|----------|---------------------------|
| Frontend | <http://localhost:81>     |
| Backend  | <http://localhost:5000>   |
| Swagger  | <http://localhost:5000/swagger> |
| MySQL    | `localhost:3307`          |

Al arrancar, el backend aplica las migraciones, siembra roles, usuarios y los
150 productos de demostración.

Para detener todo:

```bash
docker compose down
```

Para borrar también la base de datos y volver a sembrar desde cero:

```bash
docker compose down -v
```

> Nota: los contenedores llevan el sufijo `_dzacariasd1`, pero los puertos son
> los mismos del ejemplo. Si el stack de `practice3/mcalic1` está levantado, hay
> que bajarlo antes.

### Cuentas sembradas

| Rol   | Correo                  | Contraseña  |
|-------|-------------------------|-------------|
| Admin | admin@enterprise.com    | `Admin123!` |
| User  | user@enterprise.com     | `User123!`  |

---

## API

| Método | Endpoint                  | Roles            | Descripción                          |
|--------|---------------------------|------------------|--------------------------------------|
| POST   | `/api/auth/login`         | Anónimo          | Autenticación, devuelve JWT          |
| GET    | `/api/products`           | Todos            | Listado **paginado por offset**      |
| GET    | `/api/products/scroll`    | Todos            | Listado **incremental (scroll)**     |
| GET    | `/api/products/{id}`      | Todos            | Obtener un producto                  |
| POST   | `/api/products`           | Admin, Manager   | Crear                                |
| PUT    | `/api/products/{id}`      | Admin, Manager   | Actualizar                           |
| DELETE | `/api/products/{id}`      | Admin            | Eliminar                             |

Parámetros comunes de filtrado y orden: `search`, `sortBy` (`name`, `price`,
`stock`, `createdat`), `sortDirection` (`asc` / `desc`).
`GET /api/products` recibe además `page` y `pageSize`;
`GET /api/products/scroll` recibe `offset` y `limit`.
