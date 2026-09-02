-- Asigna categorías a los productos existentes, según coincidencias por nombre.
-- Ejecuta esto DESPUÉS de que el backend haya arrancado al menos una vez
-- (así ya existen las categorías sembradas: Electrónica, Oficina, Mobiliario, Cómputo, Accesorios).

USE EnterpriseDb;

UPDATE Products p
JOIN Categories c ON c.Name = 'Cómputo'
SET p.CategoryId = c.Id
WHERE p.Name IN ('Laptop Dell XPS 13', 'Disco SSD Samsung 1TB', 'Disco SSD Samsung 2TB',
                  'Memoria RAM Corsair 16GB', 'Memoria RAM Corsair 32GB', 'Docking Station Dell');

UPDATE Products p
JOIN Categories c ON c.Name = 'Electrónica'
SET p.CategoryId = c.Id
WHERE p.Name IN ('Monitor LG UltraWide 34"', 'Webcam Logitech C920', 'Audífonos Sony WH-1000XM5',
                  'Audífonos JBL Tune 510BT', 'Micrófono Blue Yeti', 'Proyector Portátil Anker',
                  'Tablet Samsung Galaxy Tab');

UPDATE Products p
JOIN Categories c ON c.Name = 'Accesorios'
SET p.CategoryId = c.Id
WHERE p.Name IN ('Mouse Logitech MX Master', 'Teclado Mecánico Keychron', 'Cable HDMI 2m',
                  'Cable USB-C 1m', 'Hub USB-C 7 en 1', 'Cargador Anker 65W',
                  'Power Bank Anker 20000mAh', 'Soporte para Laptop', 'Mousepad XXL Gamer',
                  'Lámpara LED de Escritorio');

UPDATE Products p
JOIN Categories c ON c.Name = 'Mobiliario'
SET p.CategoryId = c.Id
WHERE p.Name IN ('Silla Ergonómica Herman', 'Silla Gamer DXRacer', 'Escritorio Ajustable');

UPDATE Products p
JOIN Categories c ON c.Name = 'Oficina'
SET p.CategoryId = c.Id
WHERE p.Name IN ('Impresora HP LaserJet', 'Impresora Epson EcoTank', 'Router TP-Link AX3000',
                  'Switch de Red Netgear 8p');
