-- CREATE TABLES
-- Назва будівль
CREATE TABLE IF NOT EXISTS eco_factory (
    id SERIAL PRIMARY KEY,
    factory_name VARCHAR(255) NOT NULL
);

-- Координати будівель
CREATE TABLE IF NOT EXISTS factory_coordinates (
    id SERIAL PRIMARY KEY,
    factory_id INT NOT NULL,
    latitude DECIMAL(15, 10) NOT NULL,
    longitude DECIMAL(15, 10) NOT NULL,
    FOREIGN KEY (factory_id) REFERENCES eco_factory (id) ON DELETE CASCADE
);

-- Категорії (наприклад, 'Стан повітря')
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);

-- Компоненти кожної категорії 
CREATE TABLE IF NOT EXISTS category_component (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    component_type VARCHAR(50) CHECK (component_type IN ('Вимірювальні', 'Розраховані')),
    component_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
);

-- Дані вимірювання
CREATE TABLE IF NOT EXISTS component_measurement (
    id SERIAL PRIMARY KEY,
    component_id INT NOT NULL,
    factory_id INT NOT NULL,
    measurement_date DATE,
    value NUMERIC(18, 4),
    unit VARCHAR(50),
    FOREIGN KEY (component_id) REFERENCES category_component (id) ON DELETE CASCADE,
    FOREIGN KEY (factory_id) REFERENCES eco_factory (id) ON DELETE CASCADE
);