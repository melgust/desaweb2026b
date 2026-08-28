using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

/// <summary>
/// Seeds initial roles and users (admin + standard user) if they don't exist yet.
/// Idempotent: safe to run on every startup.
/// </summary>
public static class DbSeeder
{
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

        // --- Products (catalogo de demostracion) ---
        await SeedProductsAsync(db, ct);
    }

    /// <summary>
    /// Genera un catalogo de productos de prueba la primera vez que arranca la
    /// aplicacion. Se necesita un volumen suficiente de filas para que tanto la
    /// paginacion por offset como el scroll infinito se puedan apreciar: con 8 o
    /// 10 productos no habria nada que paginar ni que cargar al hacer scroll.
    /// Es idempotente: si ya hay productos en la base no vuelve a insertar nada.
    /// </summary>
    private static async Task SeedProductsAsync(AppDbContext db, CancellationToken ct)
    {
        if (await db.Products.AnyAsync(ct)) return;

        string[] categories =
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
            var category = categories[i % categories.Length];
            var line = lines[(i / categories.Length) % lines.Length];
            int model = 100 + i;

            products.Add(new Product
            {
                Name = $"{category} {line} {model}",
                Description = $"{category} de linea {line}, modelo {model}, equipo empresarial para uso diario.",
                Price = Math.Round((decimal)(random.NextDouble() * 2450 + 50), 2),
                Stock = random.Next(0, 250),
                IsActive = i % 17 != 0,
                CreatedAt = createdBase.AddHours(i * 7),
                UpdatedAt = createdBase.AddHours(i * 7)
            });
        }

        db.Products.AddRange(products);
        await db.SaveChangesAsync(ct);
    }
}
