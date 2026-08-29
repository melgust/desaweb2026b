using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

/// <summary>
/// Seeds initial roles, users and sample products.
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

        // --- Sample products ---
        // Add products only when the corresponding sample product does not exist.
        // This keeps the seed idempotent and makes the catalog contain 50 products
        // for a clear demonstration of offset pagination and infinite scrolling.
        var sampleProducts = new[]
        {
            ("Laptop Pro 14", "Laptop de alto rendimiento para trabajo y estudio.", 1299.99m, 18),
            ("Monitor 24 Full HD", "Monitor IPS de 24 pulgadas con resolución Full HD.", 179.99m, 40),
            ("Monitor 27 QHD", "Monitor de 27 pulgadas con resolución QHD.", 329.99m, 22),
            ("Teclado Mecánico RGB", "Teclado mecánico con iluminación RGB y switches táctiles.", 89.99m, 35),
            ("Mouse Inalámbrico", "Mouse ergonómico inalámbrico para oficina y estudio.", 29.99m, 60),
            ("Audífonos Bluetooth", "Audífonos inalámbricos con micrófono integrado.", 59.99m, 45),
            ("Webcam Full HD", "Cámara web Full HD para videollamadas y clases virtuales.", 69.99m, 28),
            ("Disco SSD 1TB", "Unidad SSD NVMe de 1 TB para almacenamiento rápido.", 99.99m, 32),
            ("Memoria RAM 16GB", "Memoria RAM DDR4 de 16 GB para equipos compatibles.", 54.99m, 50),
            ("Router WiFi 6", "Router inalámbrico de doble banda con tecnología WiFi 6.", 119.99m, 20),
            ("Adaptador USB-C", "Adaptador multipuerto USB-C para laptops modernas.", 34.99m, 42),
            ("Hub USB 3.0", "Hub USB de cuatro puertos para ampliar conexiones.", 24.99m, 55),
            ("Impresora Multifuncional", "Impresora con funciones de impresión, escaneo y copiado.", 149.99m, 16),
            ("Tablet 10 pulgadas", "Tablet de 10 pulgadas para entretenimiento y productividad.", 249.99m, 24),
            ("Smartphone X", "Teléfono inteligente con pantalla de alta resolución.", 699.99m, 30),
            ("Smartphone Lite", "Teléfono inteligente económico para uso cotidiano.", 299.99m, 38),
            ("Smartwatch Active", "Reloj inteligente con monitoreo de actividad y notificaciones.", 129.99m, 26),
            ("Cargador USB-C 65W", "Cargador rápido de 65 W compatible con USB-C.", 39.99m, 70),
            ("Batería Portátil 20000mAh", "Power bank de alta capacidad con carga rápida.", 49.99m, 48),
            ("Memoria USB 128GB", "Memoria USB 3.0 de 128 GB para transportar archivos.", 19.99m, 80),
            ("Tarjeta MicroSD 256GB", "Tarjeta MicroSD de 256 GB para dispositivos compatibles.", 27.99m, 65),
            ("Cámara de Seguridad", "Cámara IP para monitoreo de interiores con visión nocturna.", 79.99m, 33),
            ("Micrófono USB", "Micrófono USB de condensador para reuniones y grabaciones.", 74.99m, 21),
            ("Parlante Bluetooth", "Parlante portátil Bluetooth con sonido estéreo.", 64.99m, 36),
            ("Proyector HD", "Proyector compacto para presentaciones y entretenimiento.", 289.99m, 12),
            ("Cable HDMI 2m", "Cable HDMI de dos metros para video y audio digital.", 12.99m, 100),
            ("Cable USB-C 1m", "Cable USB-C de un metro para carga y transferencia de datos.", 9.99m, 120),
            ("Base para Laptop", "Base ajustable para mejorar la ergonomía del escritorio.", 44.99m, 31),
            ("Soporte para Monitor", "Soporte ajustable para monitor de escritorio.", 59.99m, 19),
            ("Silla Ergonómica", "Silla de oficina con soporte lumbar y altura ajustable.", 249.99m, 14),
            ("Escritorio de Oficina", "Escritorio compacto para trabajo y estudio.", 199.99m, 10),
            ("Lámpara LED de Escritorio", "Lámpara LED con brillo ajustable para escritorio.", 32.99m, 44),
            ("Regleta Inteligente", "Regleta con múltiples tomas y control inteligente.", 39.99m, 27),
            ("UPS 1000VA", "Sistema UPS para respaldo y protección eléctrica de equipos.", 139.99m, 15),
            ("Ventilador USB", "Ventilador compacto alimentado por USB.", 17.99m, 52),
            ("Alfombrilla XL", "Alfombrilla grande para teclado y mouse.", 21.99m, 68),
            ("Control Inalámbrico", "Control inalámbrico compatible con PC y dispositivos compatibles.", 54.99m, 29),
            ("Tarjeta de Red USB", "Adaptador USB para conexión de red Ethernet.", 18.99m, 47),
            ("Adaptador Bluetooth", "Adaptador Bluetooth USB para computadoras.", 14.99m, 58),
            ("Lector de Tarjetas", "Lector USB para tarjetas SD y MicroSD.", 16.99m, 62),
            ("Disco Externo 2TB", "Disco duro externo de 2 TB para copias y almacenamiento.", 84.99m, 23),
            ("SSD Externo 1TB", "Unidad SSD externa de 1 TB con conexión USB-C.", 109.99m, 18),
            ("Mini PC", "Computadora compacta para oficina y multimedia.", 429.99m, 13),
            ("Teclado Inalámbrico", "Teclado inalámbrico compacto para oficina.", 39.99m, 46),
            ("Mouse Gamer", "Mouse para gaming con sensor de alta precisión.", 49.99m, 34),
            ("Audífonos Gamer", "Audífonos gaming con micrófono y sonido envolvente.", 79.99m, 25),
            ("Controlador RGB", "Controlador para iluminación RGB de componentes.", 29.99m, 39),
            ("Kit de Limpieza", "Kit de limpieza para computadoras y dispositivos electrónicos.", 15.99m, 75),
            ("Soporte para Celular", "Soporte ajustable para celular de escritorio.", 13.99m, 90),
            ("Lector Biométrico USB", "Lector de huellas USB para sistemas compatibles.", 69.99m, 17)
        };

        foreach (var item in sampleProducts)
        {
            if (!await db.Products.AnyAsync(p => p.Name == item.Item1, ct))
            {
                db.Products.Add(new Product
                {
                    Name = item.Item1,
                    Description = item.Item2,
                    Price = item.Item3,
                    Stock = item.Item4,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
