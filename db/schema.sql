-- ============================================
-- 1. RESTAURANTS (sucursales) — primero, todo lo demás depende de esta
-- ============================================
CREATE TABLE restaurants (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    is_active TINYINT(1) DEFAULT 1,
    settings JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CATEGORIES — propias de cada sucursal
-- ============================================
CREATE TABLE categories (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    block_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_categories_restaurant (restaurant_id)
);

-- ============================================
-- 3. PRODUCTS — propios de cada sucursal
-- ============================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    category_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_products_restaurant (restaurant_id),
    INDEX idx_products_category (category_id)
);

-- ============================================
-- 4. PRICE_RANGES — hereda scope vía product_id (no necesita restaurant_id)
-- ============================================
CREATE TABLE price_ranges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    bonus VARCHAR(255),
    is_default TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_price_ranges_product (product_id)
);

-- ============================================
-- 5. PRODUCT_PRICES — reglas de precio por día/promoción (hereda scope)
-- ============================================
CREATE TABLE product_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    start_day INT,
    end_day INT,
    start_datetime DATETIME,
    end_datetime DATETIME,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('DAY', 'PROMOTION')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_prices_product (product_id)
);

-- ============================================
-- 6. COMBOS — propios de cada sucursal
-- ============================================
CREATE TABLE combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_combos_restaurant (restaurant_id)
);

-- ============================================
-- 7. GALLERY — propia de cada sucursal
-- ============================================
CREATE TABLE gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_gallery_restaurant (restaurant_id)
);



-- ============================================
-- 9. USUARIOS (opcional pero casi siempre necesario en multi-sucursal)
-- ============================================
CREATE TABLE users (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',  -- admin | manager | staff
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_users_restaurant (restaurant_id)
);