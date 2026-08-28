# Práctica 3 — Paginación offset + Scroll infinito

**Usuario / Rama:** `dzacariasd1`
**Universidad Mariano Gálvez de Guatemala** — Desarrollo Web 2026-2

Aplicación full-stack basada en el ejemplo de la práctica 3 (`practice3/mcalic1`),
extendida para que el listado de productos ofrezca **dos estrategias de paginación**
que el usuario puede alternar desde la misma pantalla:

1. **Paginación por offset** — la clásica, con botones *Anterior / Siguiente*.
2. **Scroll infinito** — los productos se van cargando por bloques conforme el
   usuario baja en la página, usando `IntersectionObserver`.

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
