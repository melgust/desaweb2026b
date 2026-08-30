-- Inserta 30 productos de prueba en la base de datos EnterpriseDb.
-- Útil para probar la paginación offset y el scroll infinito con suficientes filas.

USE EnterpriseDb;

INSERT INTO Products (Id, Name, Description, Price, Stock, IsActive, CreatedAt, UpdatedAt, SupplierId)
VALUES
(UUID(), 'Laptop Dell XPS 13',        'Laptop ultradelgada 13 pulgadas, 16GB RAM',        1299.99, 15, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Mouse Logitech MX Master',  'Mouse inalámbrico ergonómico',                       99.99,  50, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Teclado Mecánico Keychron', 'Teclado mecánico switches marrones',                 89.50,  40, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Monitor LG UltraWide 34"',  'Monitor curvo 34 pulgadas 144Hz',                    499.00, 12, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Webcam Logitech C920',      'Cámara web Full HD 1080p',                            69.99,  30, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Disco SSD Samsung 1TB',     'SSD NVMe M.2 alta velocidad',                        109.99,  60, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Disco SSD Samsung 2TB',     'SSD NVMe M.2 gran capacidad',                        199.99,  25, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Memoria RAM Corsair 16GB',  'Kit de memoria DDR4 3200MHz',                         59.99,  70, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Memoria RAM Corsair 32GB',  'Kit de memoria DDR4 3600MHz',                        109.99,  35, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Audífonos Sony WH-1000XM5', 'Audífonos inalámbricos con cancelación de ruido',    349.00,  20, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Audífonos JBL Tune 510BT',  'Audífonos inalámbricos económicos',                   39.99,  80, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Silla Ergonómica Herman',   'Silla de oficina ergonómica ajustable',              599.00,   8, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Silla Gamer DXRacer',       'Silla gamer con soporte lumbar',                     299.00,  18, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Escritorio Ajustable',      'Escritorio eléctrico de altura ajustable',           449.00,  10, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Impresora HP LaserJet',     'Impresora láser monocromática',                      179.99,  22, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Impresora Epson EcoTank',   'Impresora multifuncional a color',                   249.99,  16, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Router TP-Link AX3000',     'Router WiFi 6 doble banda',                          119.99,  45, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Switch de Red Netgear 8p',  'Switch Ethernet 8 puertos Gigabit',                   34.99,  38, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Cable HDMI 2m',             'Cable HDMI 2.1 alta velocidad',                        9.99, 150, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Cable USB-C 1m',            'Cable USB-C a USB-C carga rápida',                     7.99, 200, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Hub USB-C 7 en 1',          'Hub multipuerto USB-C con HDMI y lector SD',          49.99,  55, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Cargador Anker 65W',        'Cargador GaN compacto multi-puerto',                  39.99,  65, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Power Bank Anker 20000mAh', 'Batería portátil de carga rápida',                    44.99,  42, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Tablet Samsung Galaxy Tab', 'Tablet Android 10.9 pulgadas',                       329.00,  14, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Soporte para Laptop',       'Soporte ergonómico ajustable de aluminio',            29.99,  90, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Micrófono Blue Yeti',       'Micrófono USB condensador para streaming',           99.00,   26, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Lámpara LED de Escritorio', 'Lámpara regulable con puerto USB',                    24.99, 100, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Mousepad XXL Gamer',        'Mousepad extendido con bordes cosidos',               19.99, 120, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Docking Station Dell',      'Estación de acoplamiento USB-C triple monitor',      189.99,  17, 1, NOW(6), NOW(6), NULL),
(UUID(), 'Proyector Portátil Anker',  'Mini proyector LED Full HD',                         279.00,  11, 1, NOW(6), NOW(6), NULL);
