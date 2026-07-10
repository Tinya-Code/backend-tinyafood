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
