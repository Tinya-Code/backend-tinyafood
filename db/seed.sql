-- ============================================
-- TINYAFOOD DATABASE SEED SCRIPT
-- Inject initial data: 1 Restaurant + 3 Users (Admin, Manager, Staff)
-- ============================================

-- 1. Insert Default Restaurant
-- ID: 00000000-0000-0000-0000-000000000001
INSERT INTO restaurants (id, name, phone, address, location_lat, location_lng, is_active, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Tinyafood Centro',
    '+51 987654321',
    'Av. Larco 456, Miraflores, Lima',
    -12.1219760,
    -77.0297310,
    1,
    '{"theme": "dark", "currency": "PEN", "allowOnlineOrders": true}'
)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Insert Users
-- Default passwords:
--   - admin@tinyafood.com    -> password: admin123
--   - manager@tinyafood.com  -> password: manager123
--   - staff@tinyafood.com    -> password: staff123

-- Admin User
-- ID: 00000000-0000-0000-0000-000000000002
INSERT INTO users (id, restaurant_id, name, email, password_hash, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Admin Tinyafood',
    'admin@tinyafood.com',
    '$2b$10$jWKmJ/oqSpsM3kPmDmyl4em/ammiypqZ.M7oOsdUYQGC1JkDe9zvu',
    'admin',
    1
)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Manager User
-- ID: 00000000-0000-0000-0000-000000000003
INSERT INTO users (id, restaurant_id, name, email, password_hash, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Manager Tinyafood',
    'manager@tinyafood.com',
    '$2b$10$Jn9tHbbEFmSIDlOcSsQ3W.bB9V8GsZv9Ig2zHAfuN13AMDkJo85lu',
    'manager',
    1
)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Staff User
-- ID: 00000000-0000-0000-0000-000000000004
INSERT INTO users (id, restaurant_id, name, email, password_hash, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Staff Tinyafood',
    'staff@tinyafood.com',
    '$2b$10$FlguZFiN3ruOq4A9SI44fOhaDypsIoZFhkATDjCPLGHfa3BVFGNx6',
    'staff',
    1
)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 3. CATEGORIES
-- ============================================
INSERT INTO categories (id, restaurant_id, block_id, name, description, is_active) VALUES
('cat-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'blk-0001', 'Parrillas', 'Carnes a la parrilla', 1),
('cat-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'blk-0001', 'Pollos', 'Pollos asados y fritos', 1),
('cat-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'blk-0001', 'Hamburguesas', 'Hamburguesas artesanales', 1),
('cat-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'blk-0001', 'Bebidas', 'Bebidas frias y calientes', 1),
('cat-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'blk-0001', 'Postres', 'Postres y dulces', 1),
('cat-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'blk-0001', 'Combinados', 'Platos combinados', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 4. PRODUCTS (precio fijo)
-- ============================================
INSERT INTO products (id, restaurant_id, category_id, name, description, price, image_url, is_active, is_recommended) VALUES
(1, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000003', 'Hamburguesa Clasica', 'Carne 200g, lechuga, tomate, queso cheddar, salsa especial', 18.00, 'https://res.cloudinary.com/demo/image/upload/products/burger-clasica.jpg', 1, 1),
(2, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000003', 'Hamburguesa Doble', 'Doble carne 200g, doble queso, bacon, cebolla caramelizada', 28.00, 'https://res.cloudinary.com/demo/image/upload/products/burger-doble.jpg', 1, 0),
(3, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000002', 'Pollo a la Brasa', 'Medio pollo a la brasa con papas fritas y ensalada', 22.00, 'https://res.cloudinary.com/demo/image/upload/products/pollo-brasa.jpg', 1, 1),
(4, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000002', 'Quarter de Pollo', 'Cuarto de pollo con arroz, papas y ensalada', 15.00, 'https://res.cloudinary.com/demo/image/upload/products/quarter-pollo.jpg', 1, 0),
(5, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000004', 'Gaseosa Personal', 'Gaseosa 400ml (Coca-Cola, Sprite, Fanta)', 4.00, 'https://res.cloudinary.com/demo/image/upload/products/gaseosa.jpg', 1, 0),
(6, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000004', 'Agua Mineral', 'Agua sin gas 625ml', 3.00, 'https://res.cloudinary.com/demo/image/upload/products/agua.jpg', 1, 0),
(7, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000005', 'Tiramisu', 'Tiramisu casero individual', 12.00, 'https://res.cloudinary.com/demo/image/upload/products/tiramisu.jpg', 1, 1),
(8, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000005', 'Helado Artesanal', '2 bolas de helado (vainilla, chocolate, fresa)', 8.00, 'https://res.cloudinary.com/demo/image/upload/products/helado.jpg', 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 5. PRODUCTS (precio por rangos - price NULL)
-- ============================================
INSERT INTO products (id, restaurant_id, category_id, name, description, price, image_url, is_active) VALUES
(9, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000001', 'Anticuchos', 'Brochetas de corazon a la parrilla, precio variable por cantidad', NULL, 'https://res.cloudinary.com/demo/image/upload/products/anticuchos.jpg', 1),
(10, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000001', 'Punta de Anca', 'Corte de carne premium, precio por 100g', NULL, 'https://res.cloudinary.com/demo/image/upload/products/punta-anca.jpg', 1),
(11, '00000000-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000006', 'Salchipapas', 'Salchicha italiana con papas fritas, precio por porcion', NULL, 'https://res.cloudinary.com/demo/image/upload/products/salchipapas.jpg', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 6. PRICE_RANGES (para products 9, 10, 11)
-- ============================================
INSERT INTO price_ranges (product_id, quantity, unit, price, bonus, is_default) VALUES
-- Anticuchos (product 9): precio por unidad
(9, 1, 'unidad', 6.00, NULL, 0),
(9, 3, 'unidades', 16.00, '1 gratis', 0),
(9, 6, 'unidades', 30.00, '3 gratis', 1),
(9, 12, 'unidades', 55.00, '6 gratis', 0),
-- Punta de Anca (product 10): precio por 100g
(10, 1, '100g', 15.00, NULL, 0),
(10, 2, '200g', 28.00, '2so descuento', 1),
(10, 5, '500g', 65.00, '10so descuento', 0),
(10, 1, 'kg', 120.00, '30so descuento', 0),
-- Salchipapas (product 11): precio por porcion
(11, 1, 'porcion', 10.00, NULL, 1),
(11, 2, 'porciones', 18.00, '2so descuento', 0),
(11, 4, 'porciones', 34.00, '6so descuento', 0);

-- ============================================
-- 7. PRODUCT_PRICES (precios especiales)
-- ============================================

-- Hamburguesa Clasica (product 1): precio especial los viernes/sabados (DAY)
INSERT INTO product_prices (product_id, price, name, description, start_day, end_day, start_datetime, end_datetime, rule_type) VALUES
(1, 15.00, 'Happy Hour Fin de Semana', 'Descuento especial viernes y sabado', 5, 6, NULL, NULL, 'DAY');

-- Pollo a la Brasa (product 3): promocion temporal
INSERT INTO product_prices (product_id, price, name, description, start_day, end_day, start_datetime, end_datetime, rule_type) VALUES
(3, 18.00, 'Promo Lunes', 'Descuento especial los lunes', NULL, NULL, '2026-07-01 00:00:00', '2026-08-31 23:59:59', 'PROMOTION');

-- Hamburguesa Doble (product 2): promocion de inauguracion
INSERT INTO product_prices (product_id, price, name, description, start_day, end_day, start_datetime, end_datetime, rule_type) VALUES
(2, 22.00, 'Promo Inauguracion', 'Precio especial de inauguracion', NULL, NULL, '2026-07-01 00:00:00', '2026-07-31 23:59:59', 'PROMOTION');

-- Gaseosa (product 5): 2x1 los martes (DAY rule)
INSERT INTO product_prices (product_id, price, name, description, start_day, end_day, start_datetime, end_datetime, rule_type) VALUES
(5, 2.00, '2x1 Martes', 'Gaseosa 2x1 todos los martes', 2, 2, NULL, NULL, 'DAY');
