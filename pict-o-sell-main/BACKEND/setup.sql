-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pict_o_sell;
USE pict_o_sell;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `email` varchar(255) UNIQUE,
  `password` varchar(255),
  `phone` varchar(20),
  `profile_pic` varchar(255),
  `role` ENUM('buyer', 'seller', 'both') DEFAULT 'both',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` timestamp DEFAULT (current_timestamp)
);

-- Categories table with initial data
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `created_at` timestamp DEFAULT (current_timestamp)
);

-- Insert initial categories
INSERT INTO `categories` (`name`) VALUES 
('Electronics'),
('Books'),
('Fashion'),
('Sports'),
('Home & Living'),
('Others');

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `description` text,
  `price` decimal(10,2),
  `image_path` varchar(255),
  `category_id` int,
  `condition` enum('New','Used'),
  `location` varchar(255),
  `seller_id` int,
  `status` enum('Available','Sold') DEFAULT 'Available',
  `rating` DECIMAL(3,2) DEFAULT 0,
  `stock` INT DEFAULT 0,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
);

-- Cart table
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `product_id` int,
  `quantity` int DEFAULT 1,
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  UNIQUE KEY `user_product` (`user_id`, `product_id`)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `product_id` int,
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

-- Add some indexes for better performance
ALTER TABLE `users` ADD INDEX (`email`);
ALTER TABLE `products` ADD INDEX (`category_id`);
ALTER TABLE `cart` ADD INDEX (`user_id`);
ALTER TABLE `wishlist` ADD INDEX (`user_id`);
