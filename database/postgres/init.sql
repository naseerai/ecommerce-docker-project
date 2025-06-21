-- Create database
CREATE DATABASE IF NOT EXISTS ecommerce;

-- Connect to ecommerce database
\c ecommerce;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, description, price, stock) VALUES
('Laptop', 'High-performance laptop for developers', 999.99, 10),
('Smartphone', 'Latest smartphone with advanced features', 699.99, 25),
('Headphones', 'Noise-cancelling wireless headphones', 199.99, 50),
('Tablet', '10-inch tablet for work and entertainment', 399.99, 15),
('Smart Watch', 'Fitness tracking smartwatch', 249.99, 30);

-- Insert sample user (password: 'password123')
INSERT INTO users (username, email, password) VALUES
('demo', 'demo@example.com', '$2a$10$rQJ8p7qgNQ6ZLV8P1k2K2eJ9wX5N8Q7K1pL3mR5vT6nH4jG2cF8yW');
