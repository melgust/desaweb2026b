using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

/// <summary>
/// Seeds initial roles, users and sample products if they don't exist yet.
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
            adminRole = new Role
            {
                Name = "Admin",
                Description = "Full system access"
            };

            db.Roles.Add(adminRole);
        }

        var managerRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Manager", ct);
        if (managerRole == null)
        {
            managerRole = new Role
            {
                Name = "Manager",
                Description = "Can manage products"
            };

            db.Roles.Add(managerRole);
        }

        var userRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "User", ct);
        if (userRole == null)
        {
            userRole = new Role
            {
                Name = "User",
                Description = "Read-only access"
            };

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

        // --- Products ---
        if (!await db.Products.AnyAsync(ct))
        {
            var products = new List<Product>
            {
                new() { Name = "Laptop Dell Latitude 5440", Description = "Laptop empresarial Intel Core i5, 16 GB RAM y SSD 512 GB", Price = 6850.00m, Stock = 12 },
                new() { Name = "Laptop Lenovo ThinkPad E14", Description = "Laptop empresarial de 14 pulgadas con 16 GB RAM", Price = 7200.00m, Stock = 8 },
                new() { Name = "Laptop HP ProBook 450", Description = "Laptop profesional Intel Core i5 con SSD de 512 GB", Price = 6750.00m, Stock = 10 },
                new() { Name = "Laptop Acer Aspire 5", Description = "Laptop para oficina con Intel Core i5 y 8 GB RAM", Price = 5450.00m, Stock = 14 },
                new() { Name = "Laptop ASUS VivoBook 15", Description = "Laptop de 15 pulgadas con SSD de 512 GB", Price = 5950.00m, Stock = 11 },

                new() { Name = "Monitor Samsung 24 pulgadas", Description = "Monitor Full HD para oficina y uso profesional", Price = 1450.00m, Stock = 20 },
                new() { Name = "Monitor LG 27 pulgadas", Description = "Monitor IPS Full HD de 27 pulgadas", Price = 1950.00m, Stock = 15 },
                new() { Name = "Monitor Dell P2422H", Description = "Monitor empresarial Full HD de 24 pulgadas", Price = 1750.00m, Stock = 13 },
                new() { Name = "Monitor HP M24f", Description = "Monitor IPS Full HD con diseño ultradelgado", Price = 1650.00m, Stock = 18 },
                new() { Name = "Monitor Acer Nitro 27", Description = "Monitor Full HD de alta frecuencia de actualización", Price = 2250.00m, Stock = 9 },

                new() { Name = "Teclado Logitech K120", Description = "Teclado USB resistente para oficina", Price = 125.00m, Stock = 45 },
                new() { Name = "Teclado Logitech K380", Description = "Teclado Bluetooth compacto multidispositivo", Price = 295.00m, Stock = 28 },
                new() { Name = "Teclado Microsoft Wired 600", Description = "Teclado USB para uso empresarial", Price = 185.00m, Stock = 32 },
                new() { Name = "Teclado mecanico Redragon", Description = "Teclado mecanico retroiluminado", Price = 475.00m, Stock = 18 },
                new() { Name = "Teclado inalambrico HP 230", Description = "Teclado inalambrico para oficina", Price = 245.00m, Stock = 25 },

                new() { Name = "Mouse Logitech M185", Description = "Mouse inalambrico compacto", Price = 145.00m, Stock = 38 },
                new() { Name = "Mouse Logitech MX Master 3S", Description = "Mouse inalambrico profesional de alto rendimiento", Price = 850.00m, Stock = 9 },
                new() { Name = "Mouse HP Z3700", Description = "Mouse inalambrico compacto y silencioso", Price = 165.00m, Stock = 30 },
                new() { Name = "Mouse Microsoft Bluetooth", Description = "Mouse Bluetooth para computadoras portatiles", Price = 225.00m, Stock = 22 },
                new() { Name = "Mouse Redragon Cobra", Description = "Mouse optico de alta precision", Price = 275.00m, Stock = 19 },

                new() { Name = "Webcam Logitech C920", Description = "Camara web Full HD 1080p", Price = 725.00m, Stock = 14 },
                new() { Name = "Webcam Logitech C270", Description = "Camara web HD para videollamadas", Price = 295.00m, Stock = 26 },
                new() { Name = "Webcam Microsoft LifeCam", Description = "Camara web HD con microfono integrado", Price = 410.00m, Stock = 16 },
                new() { Name = "Webcam Redragon Hitman", Description = "Camara Full HD para reuniones y streaming", Price = 525.00m, Stock = 12 },
                new() { Name = "Webcam NexiGo 1080p", Description = "Camara web Full HD con enfoque automatico", Price = 495.00m, Stock = 17 },

                new() { Name = "Router TP-Link Archer AX23", Description = "Router Wi-Fi 6 de doble banda", Price = 590.00m, Stock = 18 },
                new() { Name = "Router TP-Link Archer C6", Description = "Router inalambrico AC1200", Price = 390.00m, Stock = 23 },
                new() { Name = "Router ASUS RT-AX55", Description = "Router Wi-Fi 6 para hogar y oficina", Price = 780.00m, Stock = 11 },
                new() { Name = "Router Mercusys MR70X", Description = "Router Wi-Fi 6 de alto rendimiento", Price = 445.00m, Stock = 20 },
                new() { Name = "Router Linksys E5400", Description = "Router inalambrico AC1200 de doble banda", Price = 465.00m, Stock = 15 },

                new() { Name = "Switch TP-Link 8 puertos", Description = "Switch Gigabit de escritorio", Price = 285.00m, Stock = 30 },
                new() { Name = "Switch TP-Link 16 puertos", Description = "Switch Gigabit para pequeñas oficinas", Price = 650.00m, Stock = 16 },
                new() { Name = "Switch D-Link 8 puertos", Description = "Switch Gigabit compacto", Price = 310.00m, Stock = 24 },
                new() { Name = "Switch Netgear 16 puertos", Description = "Switch Gigabit no administrable", Price = 790.00m, Stock = 10 },
                new() { Name = "Switch Cisco 8 puertos", Description = "Switch Gigabit para pequeñas empresas", Price = 950.00m, Stock = 8 },

                new() { Name = "Impresora HP LaserJet Pro", Description = "Impresora laser monocromatica para oficina", Price = 1850.00m, Stock = 7 },
                new() { Name = "Impresora Epson EcoTank L3250", Description = "Impresora multifuncional con sistema de tinta continua", Price = 2200.00m, Stock = 11 },
                new() { Name = "Impresora Canon Pixma G3110", Description = "Impresora multifuncional de tinta continua", Price = 2050.00m, Stock = 9 },
                new() { Name = "Impresora Brother HL-L2370", Description = "Impresora laser monocromatica con red", Price = 1950.00m, Stock = 8 },
                new() { Name = "Impresora Epson L4260", Description = "Multifuncional EcoTank con impresion duplex", Price = 2850.00m, Stock = 6 },

                new() { Name = "SSD Kingston 1TB", Description = "Unidad de estado solido SATA de 1 TB", Price = 620.00m, Stock = 25 },
                new() { Name = "SSD Kingston 500GB", Description = "Unidad de estado solido SATA de 500 GB", Price = 395.00m, Stock = 32 },
                new() { Name = "SSD NVMe Crucial 1TB", Description = "Unidad NVMe PCIe de alto rendimiento", Price = 745.00m, Stock = 19 },
                new() { Name = "SSD Samsung 980 1TB", Description = "Unidad NVMe PCIe de alta velocidad", Price = 825.00m, Stock = 17 },
                new() { Name = "SSD Western Digital 500GB", Description = "Unidad SSD SATA para computadora", Price = 410.00m, Stock = 28 },

                new() { Name = "Disco duro externo Seagate 2TB", Description = "Disco portatil USB 3.0 de 2 TB", Price = 690.00m, Stock = 21 },
                new() { Name = "Disco duro externo WD 1TB", Description = "Disco portatil USB 3.0 de 1 TB", Price = 525.00m, Stock = 24 },
                new() { Name = "Disco duro Western Digital 4TB", Description = "Disco duro interno SATA para almacenamiento", Price = 950.00m, Stock = 14 },
                new() { Name = "Disco duro Seagate Barracuda 2TB", Description = "Disco duro interno SATA de 2 TB", Price = 575.00m, Stock = 18 },
                new() { Name = "Disco duro Toshiba 1TB", Description = "Disco duro interno SATA de 1 TB", Price = 390.00m, Stock = 20 },

                new() { Name = "Memoria USB SanDisk 64GB", Description = "Unidad flash USB 3.0", Price = 95.00m, Stock = 60 },
                new() { Name = "Memoria USB Kingston 128GB", Description = "Unidad flash USB de alta capacidad", Price = 165.00m, Stock = 42 },
                new() { Name = "Memoria USB Samsung 64GB", Description = "Unidad flash USB 3.1 compacta", Price = 135.00m, Stock = 37 },
                new() { Name = "Memoria USB Kingston 32GB", Description = "Unidad flash USB para documentos", Price = 65.00m, Stock = 75 },
                new() { Name = "Memoria USB SanDisk 256GB", Description = "Unidad flash USB de gran capacidad", Price = 295.00m, Stock = 31 },

                new() { Name = "Audifonos JBL Tune 510BT", Description = "Audifonos Bluetooth inalambricos", Price = 425.00m, Stock = 17 },
                new() { Name = "Audifonos Logitech H390", Description = "Headset USB con microfono para videollamadas", Price = 310.00m, Stock = 24 },
                new() { Name = "Audifonos Sony WH-CH520", Description = "Audifonos Bluetooth con larga duracion de bateria", Price = 485.00m, Stock = 15 },
                new() { Name = "Audifonos HyperX Cloud Stinger", Description = "Headset con microfono para computadora", Price = 525.00m, Stock = 12 },
                new() { Name = "Audifonos Samsung USB-C", Description = "Auriculares con conexion USB-C", Price = 185.00m, Stock = 33 },

                new() { Name = "Bocinas Logitech Z120", Description = "Bocinas estereo compactas USB", Price = 175.00m, Stock = 27 },
                new() { Name = "Bocinas Logitech Z313", Description = "Sistema de bocinas 2.1 con subwoofer", Price = 525.00m, Stock = 13 },
                new() { Name = "Bocina JBL Go 3", Description = "Bocina Bluetooth portatil", Price = 350.00m, Stock = 21 },
                new() { Name = "Bocina Xiaomi Compact", Description = "Bocina Bluetooth portatil compacta", Price = 295.00m, Stock = 18 },
                new() { Name = "Bocinas Creative Pebble", Description = "Bocinas USB para escritorio", Price = 315.00m, Stock = 16 },

                new() { Name = "UPS APC 900VA", Description = "Sistema de respaldo de energia para computadoras", Price = 950.00m, Stock = 13 },
                new() { Name = "UPS Forza 1000VA", Description = "UPS con regulacion automatica de voltaje", Price = 825.00m, Stock = 12 },
                new() { Name = "UPS APC 1500VA", Description = "Sistema de respaldo para equipos de oficina", Price = 1650.00m, Stock = 7 },
                new() { Name = "UPS CyberPower 1200VA", Description = "UPS con pantalla LCD y AVR", Price = 1250.00m, Stock = 9 },
                new() { Name = "Regulador de voltaje Forza", Description = "Regulador automatico para equipos electronicos", Price = 275.00m, Stock = 28 },

                new() { Name = "Proyector Epson PowerLite", Description = "Proyector profesional para presentaciones", Price = 4850.00m, Stock = 5 },
                new() { Name = "Proyector BenQ MX560", Description = "Proyector para oficina y educacion", Price = 5250.00m, Stock = 4 },
                new() { Name = "Proyector ViewSonic PA503", Description = "Proyector de alta luminosidad para presentaciones", Price = 4450.00m, Stock = 6 },
                new() { Name = "Pantalla para proyector 100 pulgadas", Description = "Pantalla enrollable para presentaciones", Price = 850.00m, Stock = 8 },
                new() { Name = "Puntero laser Logitech R400", Description = "Presentador inalambrico para diapositivas", Price = 325.00m, Stock = 18 },

                new() { Name = "Tablet Samsung Galaxy Tab A9", Description = "Tablet Android para trabajo y estudio", Price = 1950.00m, Stock = 14 },
                new() { Name = "Tablet Lenovo Tab M10", Description = "Tablet de 10 pulgadas con Android", Price = 1750.00m, Stock = 10 },
                new() { Name = "Tablet Xiaomi Redmi Pad SE", Description = "Tablet Android con pantalla de 11 pulgadas", Price = 2150.00m, Stock = 12 },
                new() { Name = "Tablet Samsung Galaxy Tab S6 Lite", Description = "Tablet con lapiz digital para productividad", Price = 3450.00m, Stock = 7 },
                new() { Name = "Tablet Huawei MatePad SE", Description = "Tablet de 10 pulgadas para oficina y estudio", Price = 1850.00m, Stock = 9 },

                new() { Name = "Adaptador USB-C multipuerto", Description = "Adaptador con HDMI, USB 3.0 y lector de tarjetas", Price = 325.00m, Stock = 36 },
                new() { Name = "Hub USB 3.0 de 4 puertos", Description = "Concentrador USB de alta velocidad", Price = 145.00m, Stock = 31 },
                new() { Name = "Adaptador USB a Ethernet", Description = "Adaptador de red Gigabit por USB", Price = 195.00m, Stock = 27 },
                new() { Name = "Adaptador HDMI a VGA", Description = "Convertidor de señal HDMI a VGA", Price = 125.00m, Stock = 34 },
                new() { Name = "Adaptador DisplayPort a HDMI", Description = "Adaptador para conectar monitores HDMI", Price = 155.00m, Stock = 22 },

                new() { Name = "Cable HDMI 2 metros", Description = "Cable HDMI de alta velocidad", Price = 75.00m, Stock = 70 },
                new() { Name = "Cable HDMI 5 metros", Description = "Cable HDMI de alta velocidad para salas", Price = 135.00m, Stock = 45 },
                new() { Name = "Cable de red Cat6 5 metros", Description = "Cable Ethernet Gigabit categoria 6", Price = 55.00m, Stock = 80 },
                new() { Name = "Cable de red Cat6 10 metros", Description = "Cable Ethernet Gigabit categoria 6", Price = 85.00m, Stock = 65 },
                new() { Name = "Cable USB-C 2 metros", Description = "Cable USB-C para carga y transferencia de datos", Price = 95.00m, Stock = 58 },

                new() { Name = "Camara IP TP-Link Tapo C200", Description = "Camara Wi-Fi de seguridad con vision nocturna", Price = 295.00m, Stock = 22 },
                new() { Name = "Camara IP Hikvision 4MP", Description = "Camara IP profesional de vigilancia", Price = 725.00m, Stock = 15 },
                new() { Name = "Camara IP Dahua 4MP", Description = "Camara de seguridad IP para interiores y exteriores", Price = 695.00m, Stock = 13 },
                new() { Name = "Camara Tapo C310", Description = "Camara Wi-Fi para exteriores", Price = 425.00m, Stock = 17 },
                new() { Name = "NVR Hikvision 8 canales", Description = "Grabador de video en red para camaras IP", Price = 1250.00m, Stock = 8 },

                new() { Name = "Microfono Fifine USB", Description = "Microfono condensador USB para reuniones y grabacion", Price = 495.00m, Stock = 11 },
                new() { Name = "Microfono HyperX SoloCast", Description = "Microfono USB para videollamadas y grabacion", Price = 650.00m, Stock = 9 },
                new() { Name = "Silla ergonomica de oficina", Description = "Silla ajustable con soporte lumbar", Price = 1350.00m, Stock = 9 },
                new() { Name = "Escritorio ejecutivo", Description = "Escritorio de oficina con acabado moderno", Price = 1850.00m, Stock = 6 },
                new() { Name = "Soporte para monitor", Description = "Brazo ajustable para monitor de escritorio", Price = 350.00m, Stock = 18 },

                new() { Name = "Base refrigerante para laptop", Description = "Base con ventiladores para equipos portatiles", Price = 225.00m, Stock = 26 },
                new() { Name = "Extension electrica 6 tomas", Description = "Regleta electrica con proteccion contra sobretension", Price = 135.00m, Stock = 40 },
                new() { Name = "Lector de codigo de barras", Description = "Escaner USB para comercio e inventario", Price = 650.00m, Stock = 12 },
                new() { Name = "Impresora termica POS", Description = "Impresora termica USB para puntos de venta", Price = 875.00m, Stock = 10 },
                new() { Name = "Mouse Pad XL", Description = "Alfombrilla amplia para teclado y mouse", Price = 115.00m, Stock = 35 },

                new() { Name = "Cargador USB-C 65W", Description = "Cargador rapido para laptops y dispositivos moviles", Price = 295.00m, Stock = 24 },
                new() { Name = "Power Bank 20000mAh", Description = "Bateria portatil de alta capacidad", Price = 325.00m, Stock = 20 },
                new() { Name = "Memoria RAM Kingston 16GB DDR4", Description = "Modulo de memoria DDR4 para computadora", Price = 395.00m, Stock = 29 },
                new() { Name = "Memoria RAM Corsair 32GB DDR4", Description = "Kit de memoria DDR4 de alto rendimiento", Price = 745.00m, Stock = 14 },
                new() { Name = "Docking Station USB-C", Description = "Estacion de acoplamiento para laptop con multiples puertos", Price = 895.00m, Stock = 12 }
            };

            db.Products.AddRange(products);
            await db.SaveChangesAsync(ct);
        }
    }
}