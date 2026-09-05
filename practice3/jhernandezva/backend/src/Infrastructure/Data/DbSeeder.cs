using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        // --- 1. Roles ---
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

        // --- 2. Users ---
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

        // --- 3. Categories ---
        if (!await db.Set<Category>().AnyAsync(ct))
        {
            db.Set<Category>().AddRange(
                new Category { Name = "Electrónica", Description = "Dispositivos y gadgets" },
                new Category { Name = "Cómputo", Description = "Equipos de cómputo y accesorios" }
            );
            await db.SaveChangesAsync(ct);
        }

        // --- 4. Suppliers ---
        if (!await db.Set<Supplier>().AnyAsync(ct))
        {
            db.Set<Supplier>().AddRange(
                new Supplier { Name = "Distribuidora Tech SA", ContactEmail = "contacto@tech.com", Phone = "5550192" },
                new Supplier { Name = "Global Import", ContactEmail = "ventas@globalimport.com", Phone = "5559821" }
            );
            await db.SaveChangesAsync(ct);
        }

        // --- 5. Products ---
        if (!await db.Set<Product>().AnyAsync(ct))
        {
            var category = await db.Set<Category>().FirstOrDefaultAsync(ct);
            var supplier = await db.Set<Supplier>().FirstOrDefaultAsync(ct);

            db.Set<Product>().AddRange(
                new Product 
                { 
                    Name = "Laptop Dell XPS 15", 
                    Description = "Laptop de alto rendimiento 16GB RAM", 
                    Price = 12500.00m, 
                    Stock = 10,
                    CategoryId = category?.Id,
                    SupplierId = supplier?.Id
                },
                new Product 
                { 
                    Name = "Teclado Mecánico RGB", 
                    Description = "Switch Red silencioso", 
                    Price = 450.00m, 
                    Stock = 25,
                    CategoryId = category?.Id,
                    SupplierId = supplier?.Id
                },
                new Product 
                { 
                    Name = "Monitor 27 IPS 4K", 
                    Description = "Monitor para diseño y desarrollo", 
                    Price = 3200.00m, 
                    Stock = 15,
                    CategoryId = category?.Id,
                    SupplierId = supplier?.Id
                }
            );
            await db.SaveChangesAsync(ct);
        }

        // --- 6. Clients ---
        if (!await db.Set<Client>().AnyAsync(ct))
        {
            db.Set<Client>().AddRange(
                new Client { Name = "Carlos Gómez", Email = "carlos.gomez@gmail.com", Phone = "55512345" },
                new Client { Name = "María Rodríguez", Email = "maria.rodriguez@gmail.com", Phone = "55598765" }
            );
            await db.SaveChangesAsync(ct);
        }
    }
}