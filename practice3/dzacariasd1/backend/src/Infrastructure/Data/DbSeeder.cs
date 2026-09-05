using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

/// <summary>
/// Siembra los datos iniciales (roles, usuarios, categorias y productos) si aun
/// no existen. Idempotente: es seguro ejecutarlo en cada arranque.
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Categoria a la que se asigna un producto segun como empiece su nombre.
    /// El orden importa: los prefijos mas largos se evaluan primero.
    /// </summary>
    private static readonly (string Prefijo, string Categoria)[] MapaCategorias =
    {
        ("Docking Station", "Perifericos"),
        ("Disco Duro",      "Almacenamiento"),
        ("Memoria RAM",     "Componentes"),
        ("Laptop",          "Computo"),
        ("Servidor",        "Computo"),
        ("Tablet",          "Computo"),
        ("Monitor",         "Perifericos"),
        ("Teclado",         "Perifericos"),
        ("Mouse",           "Perifericos"),
        ("Router",          "Redes"),
        ("Switch",          "Redes"),
        ("Impresora",       "Impresion"),
        ("Escaner",         "Impresion"),
        ("Camara",          "Audio y Video"),
        ("Proyector",       "Audio y Video"),
    };

    private static readonly (string Nombre, string Descripcion)[] Categorias =
    {
        ("Computo",        "Equipos de computo: laptops, servidores y tabletas."),
        ("Perifericos",    "Dispositivos de entrada y salida conectados al equipo."),
        ("Redes",          "Equipo de conectividad y comunicaciones."),
        ("Impresion",      "Impresoras, escaneres y equipo de digitalizacion."),
        ("Almacenamiento", "Unidades de disco y medios de almacenamiento."),
        ("Componentes",    "Partes internas y refacciones."),
        ("Audio y Video",  "Camaras, proyectores y equipo multimedia."),
        ("General",        "Productos sin una categoria especifica asignada."),
    };

    /// <summary>Proveedor que surte cada categoria de producto.</summary>
    private static readonly (string Categoria, string Proveedor)[] ProveedorPorCategoria =
    {
        ("Computo",        "Distribuidora Tecnologica S.A."),
        ("Perifericos",    "Importaciones Perifericos GT"),
        ("Redes",          "Redes y Conectividad de Guatemala"),
        ("Impresion",      "Suministros de Impresion Central"),
        ("Almacenamiento", "Almacenamiento Digital S.A."),
        ("Componentes",    "Almacenamiento Digital S.A."),
        ("Audio y Video",  "Multimedia Corporativa"),
    };

    private static readonly (string Nombre, string Correo, string Telefono)[] Proveedores =
    {
        ("Distribuidora Tecnologica S.A.",     "ventas@distecgt.com",      "2234-5600"),
        ("Importaciones Perifericos GT",       "contacto@perifgt.com",     "2245-1180"),
        ("Redes y Conectividad de Guatemala",  "info@redesgt.com",         "2278-9040"),
        ("Suministros de Impresion Central",   "pedidos@impcentral.com",   "2290-3312"),
        ("Almacenamiento Digital S.A.",        "ventas@almadigital.com",   "2261-7725"),
        ("Multimedia Corporativa",             "soporte@multicorp.com",    "2283-4419"),
    };

    private static readonly (string Nombre, string Nit, string Correo, string Telefono, string Direccion)[] Clientes =
    {
        ("Comercial San Miguel, S.A.", "1234567-8", "compras@sanmiguel.com.gt", "2360-1100", "7a. Avenida 12-45, Zona 9, Guatemala"),
        ("Constructora El Roble",      "2345678-9", "admin@elroble.com.gt",     "2412-8890", "Calzada Roosevelt 22-10, Zona 11, Guatemala"),
        ("Colegio Mixto La Esperanza", "3456789-0", "direccion@laesperanza.edu.gt", "2331-5570", "5a. Calle 3-20, Zona 1, Mixco"),
        ("Farmacias del Centro",       "4567890-1", "gerencia@farmacentro.com.gt", "2288-4402", "Boulevard Liberacion 8-15, Zona 13, Guatemala"),
        ("Transportes La Union",       "5678901-2", "operaciones@launion.com.gt",  "2455-9931", "Km 15.5 Carretera al Atlantico, Zona 18"),
    };

    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        // --- Roles ---
        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin", ct);
        if (adminRole == null)
        {
            adminRole = new Role { Name = "Admin", Description = "Full system access" };
            db.Roles.Add(adminRole);
        }

        var managerRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Manager", ct);
        if (managerRole == null)
        {
            managerRole = new Role { Name = "Manager", Description = "Can manage products" };
            db.Roles.Add(managerRole);
        }

        var userRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "User", ct);
        if (userRole == null)
        {
            userRole = new Role { Name = "User", Description = "Read-only access" };
            db.Roles.Add(userRole);
        }

        await db.SaveChangesAsync(ct);

        // --- Users ---
        if (!await db.Users.AnyAsync(u => u.Email == "admin@enterprise.com", ct))
        {
            db.Users.Add(new User
            {
                Name = "System Administrator",
                Email = "admin@enterprise.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                RoleId = adminRole.Id
            });
        }

        if (!await db.Users.AnyAsync(u => u.Email == "user@enterprise.com", ct))
        {
            db.Users.Add(new User
            {
                Name = "Standard User",
                Email = "user@enterprise.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"),
                RoleId = userRole.Id
            });
        }

        await db.SaveChangesAsync(ct);

        // --- Categorias, proveedores, clientes y productos ---
        var categorias = await SeedCategoriesAsync(db, ct);
        var proveedores = await SeedSuppliersAsync(db, ct);
        await SeedClientsAsync(db, ct);
        await SeedProductsAsync(db, categorias, proveedores, ct);
        await AsignarCategoriaFaltanteAsync(db, categorias, ct);
        await AsignarProveedorFaltanteAsync(db, categorias, proveedores, ct);
    }

    /// <summary>
    /// Crea las categorias que falten y devuelve un diccionario nombre -> Id para
    /// poder asignarlas a los productos sin volver a consultar la base.
    /// </summary>
    private static async Task<Dictionary<string, Guid>> SeedCategoriesAsync(AppDbContext db, CancellationToken ct)
    {
        var existentes = await db.Categories.ToDictionaryAsync(c => c.Name, c => c, ct);

        foreach (var (nombre, descripcion) in Categorias)
        {
            if (existentes.ContainsKey(nombre)) continue;

            var nueva = new Category { Name = nombre, Description = descripcion };
            db.Categories.Add(nueva);
            existentes[nombre] = nueva;
        }

        await db.SaveChangesAsync(ct);

        return existentes.ToDictionary(kv => kv.Key, kv => kv.Value.Id);
    }

    /// <summary>
    /// Genera un catalogo de productos de prueba la primera vez que arranca la
    /// aplicacion. Se necesita un volumen suficiente de filas para que tanto la
    /// paginacion por offset como el scroll infinito se puedan apreciar: con 8 o
    /// 10 productos no habria nada que paginar ni que cargar al hacer scroll.
    /// Es idempotente: si ya hay productos en la base no vuelve a insertar nada.
    /// </summary>
    private static async Task SeedProductsAsync(AppDbContext db, Dictionary<string, Guid> categorias, Dictionary<string, Guid> proveedores, CancellationToken ct)
    {
        if (await db.Products.AnyAsync(ct)) return;

        string[] tipos =
        {
            "Laptop", "Monitor", "Teclado", "Mouse", "Impresora", "Router",
            "Servidor", "Switch", "Tablet", "Camara", "Proyector", "Escaner",
            "Disco Duro", "Memoria RAM", "Docking Station"
        };

        string[] lines = { "Pro", "Plus", "Lite", "Max", "Business", "Compact", "Ultra", "Essential" };

        // Semilla fija para que el catalogo sea reproducible en cada instalacion.
        var random = new Random(2026);
        var createdBase = DateTime.UtcNow.AddDays(-180);
        var products = new List<Product>();

        int total = 150;
        for (int i = 0; i < total; i++)
        {
            var tipo = tipos[i % tipos.Length];
            var line = lines[(i / tipos.Length) % lines.Length];
            int model = 100 + i;
            var nombre = tipo + " " + line + " " + model;

            products.Add(new Product
            {
                Name = nombre,
                Description = tipo + " de linea " + line + ", modelo " + model + ", equipo empresarial para uso diario.",
                Price = Math.Round((decimal)(random.NextDouble() * 2450 + 50), 2),
                Stock = random.Next(0, 250),
                IsActive = i % 17 != 0,
                CreatedAt = createdBase.AddHours(i * 7),
                UpdatedAt = createdBase.AddHours(i * 7),
                CategoryId = ResolverCategoria(nombre, categorias),
                SupplierId = ResolverProveedor(nombre, categorias, proveedores)
            });
        }

        db.Products.AddRange(products);
        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Asigna categoria a los productos que quedaron sin ella: los que ya existian
    /// en la base antes de crear la tabla Categorias, y cualquiera creado a mano
    /// sin elegir categoria.
    /// </summary>
    private static async Task AsignarCategoriaFaltanteAsync(AppDbContext db, Dictionary<string, Guid> categorias, CancellationToken ct)
    {
        var sinCategoria = await db.Products.Where(p => p.CategoryId == null).ToListAsync(ct);
        if (sinCategoria.Count == 0) return;

        foreach (var p in sinCategoria)
            p.CategoryId = ResolverCategoria(p.Name, categorias);

        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Crea los proveedores que falten y devuelve un diccionario nombre -> Id.
    /// </summary>
    private static async Task<Dictionary<string, Guid>> SeedSuppliersAsync(AppDbContext db, CancellationToken ct)
    {
        var existentes = await db.Suppliers.ToDictionaryAsync(s => s.Name, s => s, ct);

        foreach (var (nombre, correo, telefono) in Proveedores)
        {
            if (existentes.ContainsKey(nombre)) continue;

            var nuevo = new Supplier { Name = nombre, ContactEmail = correo, Phone = telefono };
            db.Suppliers.Add(nuevo);
            existentes[nombre] = nuevo;
        }

        await db.SaveChangesAsync(ct);

        return existentes.ToDictionary(kv => kv.Key, kv => kv.Value.Id);
    }

    /// <summary>
    /// Crea los clientes de demostracion. Sin clientes no se puede emitir ninguna
    /// factura, asi que hacen falta para poder probar el modulo de facturacion.
    /// </summary>
    private static async Task SeedClientsAsync(AppDbContext db, CancellationToken ct)
    {
        foreach (var (nombre, nit, correo, telefono, direccion) in Clientes)
        {
            if (await db.Clients.AnyAsync(c => c.Nit == nit, ct)) continue;

            db.Clients.Add(new Client
            {
                Name = nombre,
                Nit = nit,
                Email = correo,
                Phone = telefono,
                Address = direccion
            });
        }

        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Asigna proveedor a los productos que quedaron sin el, igual que se hizo con
    /// las categorias al agregar aquella tabla.
    /// </summary>
    private static async Task AsignarProveedorFaltanteAsync(AppDbContext db, Dictionary<string, Guid> categorias, Dictionary<string, Guid> proveedores, CancellationToken ct)
    {
        var sinProveedor = await db.Products.Where(p => p.SupplierId == null).ToListAsync(ct);
        if (sinProveedor.Count == 0) return;

        bool huboCambios = false;
        foreach (var p in sinProveedor)
        {
            var id = ResolverProveedor(p.Name, categorias, proveedores);
            if (id == null) continue;
            p.SupplierId = id;
            huboCambios = true;
        }

        if (huboCambios) await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// El proveedor se deduce de la categoria del producto. Los productos de la
    /// categoria General se quedan sin proveedor, porque no se sabe quien los surte.
    /// </summary>
    private static Guid? ResolverProveedor(string nombreProducto, Dictionary<string, Guid> categorias, Dictionary<string, Guid> proveedores)
    {
        foreach (var (prefijo, categoria) in MapaCategorias)
        {
            if (!nombreProducto.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase)) continue;

            foreach (var (cat, proveedor) in ProveedorPorCategoria)
            {
                if (cat == categoria && proveedores.TryGetValue(proveedor, out var id))
                    return id;
            }
        }

        return null;
    }

    /// <summary>
    /// Deduce la categoria a partir del nombre del producto. Si ningun prefijo
    /// coincide, cae en "General".
    /// </summary>
    private static Guid ResolverCategoria(string nombreProducto, Dictionary<string, Guid> categorias)
    {
        foreach (var (prefijo, categoria) in MapaCategorias)
        {
            if (nombreProducto.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase)
                && categorias.TryGetValue(categoria, out var id))
            {
                return id;
            }
        }

        return categorias["General"];
    }
}
