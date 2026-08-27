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

        // --- Products ---
        if (!await db.Products.AnyAsync(ct))
        {
            var products = new List<Product>
            {
                new() { Name = "Laptop Lenovo", Description = "Laptop empresarial", Price = 7500.00m, Stock = 15 },
                new() { Name = "Mouse Logitech", Description = "Mouse inalámbrico", Price = 175.00m, Stock = 40 },
                new() { Name = "Teclado Mecánico", Description = "Teclado para escritorio", Price = 450.00m, Stock = 20 },
                new() { Name = "Monitor Samsung", Description = "Monitor de 24 pulgadas", Price = 1500.00m, Stock = 12 },
                new() { Name = "Audífonos HyperX", Description = "Audífonos con micrófono", Price = 600.00m, Stock = 18 },
                new() { Name = "Webcam Logitech", Description = "Webcam Full HD", Price = 525.00m, Stock = 14 },
                new() { Name = "Memoria USB 64GB", Description = "Unidad flash USB", Price = 95.00m, Stock = 50 },
                new() { Name = "Disco SSD 1TB", Description = "Unidad de estado sólido", Price = 850.00m, Stock = 25 },
                new() { Name = "Router TP-Link", Description = "Router inalámbrico", Price = 400.00m, Stock = 16 },
                new() { Name = "Impresora Epson", Description = "Impresora multifuncional", Price = 1900.00m, Stock = 8 },

                new() { Name = "Laptop HP", Description = "Laptop para oficina", Price = 6800.00m, Stock = 10 },
                new() { Name = "Mouse Genius", Description = "Mouse óptico", Price = 85.00m, Stock = 35 },
                new() { Name = "Teclado Logitech", Description = "Teclado inalámbrico", Price = 325.00m, Stock = 22 },
                new() { Name = "Monitor LG", Description = "Monitor de 27 pulgadas", Price = 2100.00m, Stock = 9 },
                new() { Name = "Audífonos Sony", Description = "Audífonos bluetooth", Price = 725.00m, Stock = 13 },
                new() { Name = "Webcam Genius", Description = "Webcam HD", Price = 275.00m, Stock = 17 },
                new() { Name = "Memoria USB 128GB", Description = "Unidad flash de alta capacidad", Price = 160.00m, Stock = 30 },
                new() { Name = "Disco SSD 500GB", Description = "SSD para computadora", Price = 475.00m, Stock = 28 },
                new() { Name = "Router D-Link", Description = "Router WiFi", Price = 350.00m, Stock = 11 },
                new() { Name = "Impresora Canon", Description = "Impresora de tinta", Price = 1400.00m, Stock = 7 },

                new() { Name = "Laptop Dell", Description = "Laptop empresarial Dell", Price = 8200.00m, Stock = 6 },
                new() { Name = "Mouse Razer", Description = "Mouse gaming", Price = 475.00m, Stock = 19 },
                new() { Name = "Teclado Redragon", Description = "Teclado mecánico gaming", Price = 550.00m, Stock = 21 },
                new() { Name = "Monitor Asus", Description = "Monitor Full HD", Price = 2300.00m, Stock = 8 },
                new() { Name = "Audífonos JBL", Description = "Audífonos inalámbricos", Price = 650.00m, Stock = 24 },
                new() { Name = "Webcam Microsoft", Description = "Cámara para videollamadas", Price = 580.00m, Stock = 12 },
                new() { Name = "Memoria SD 128GB", Description = "Tarjeta de memoria", Price = 180.00m, Stock = 45 },
                new() { Name = "Disco HDD 2TB", Description = "Disco duro interno", Price = 625.00m, Stock = 20 },
                new() { Name = "Switch TP-Link", Description = "Switch de red de 8 puertos", Price = 300.00m, Stock = 15 },
                new() { Name = "UPS Forza", Description = "Respaldo de energía", Price = 850.00m, Stock = 10 }
            };

            db.Products.AddRange(products);

            await db.SaveChangesAsync(ct);
        }
    }
}
