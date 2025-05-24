-- Create database
CREATE DATABASE calorie_tracker;

-- Use the database
\c calorie_tracker;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    age INTEGER,
    gender VARCHAR(10),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food categories table
CREATE TABLE food_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

-- Foods table
CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories_per_100g DECIMAL(6,2) NOT NULL,
    protein_per_100g DECIMAL(6,2) DEFAULT 0,
    carbs_per_100g DECIMAL(6,2) DEFAULT 0,
    fat_per_100g DECIMAL(6,2) DEFAULT 0
);

-- Food entries table
CREATE TABLE food_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    food_id INTEGER REFERENCES foods(id),
    category_id INTEGER REFERENCES food_categories(id),
    quantity DECIMAL(6,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default food categories
INSERT INTO food_categories (name, is_default) VALUES 
('Breakfast', TRUE),
('Lunch', TRUE),
('Dinner', TRUE);

-- Insert sample foods
INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Apple', 52, 0.3, 14, 0.2),
('Banana', 89, 1.1, 23, 0.3),
('Chicken Breast', 165, 31, 0, 3.6),
('Rice', 130, 2.7, 28, 0.3),
('Broccoli', 34, 2.8, 7, 0.4),
('Salmon', 208, 20, 0, 13),
('Eggs', 155, 13, 1.1, 11),
('Bread', 265, 9, 49, 3.2),
('Milk', 42, 3.4, 5, 1),
('Pasta', 131, 5, 25, 1.1);
