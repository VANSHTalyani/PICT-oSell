-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pict_o_sell;
USE pict_o_sell;

-- Users table
CREATE TABLE IF NOT EXISTS `Users` (
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
CREATE TABLE IF NOT EXISTS `Categories` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `created_at` timestamp DEFAULT (current_timestamp)
);

-- Insert initial categories
INSERT INTO `Categories` (`name`) VALUES 
('Electronics'),
('Books'),
('Fashion'),
('Sports'),
('Home & Living'),
('Others');

-- Products table
CREATE TABLE IF NOT EXISTS `Products` (
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
  FOREIGN KEY (`category_id`) REFERENCES `Categories` (`id`),
  FOREIGN KEY (`seller_id`) REFERENCES `Users` (`id`)
);

-- Cart table
CREATE TABLE IF NOT EXISTS `Carts` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `product_id` int,
  `quantity` int DEFAULT 1,
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`),
  UNIQUE KEY `user_product` (`user_id`, `product_id`)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS `Wishlists` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `product_id` int,
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`)
);

-- Orders table
CREATE TABLE IF NOT EXISTS `Orders` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `total_amount` decimal(10,2),
  `shipping_address` text,
  `payment_method` enum('Cash on Delivery', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking') DEFAULT 'Cash on Delivery',
  `payment_status` enum('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
  `order_status` enum('Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Placed',
  `created_at` timestamp DEFAULT (current_timestamp),
  `updated_at` timestamp DEFAULT (current_timestamp) ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS `OrderItems` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `product_id` int,
  `quantity` int,
  `price` decimal(10,2),
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`order_id`) REFERENCES `Orders` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS `Reviews` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `user_id` int,
  `rating` int,
  `comment` text,
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS `Transactions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `user_id` int,
  `amount` decimal(10,2),
  `payment_method` enum('Cash on Delivery', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'),
  `transaction_id` varchar(255),
  `status` enum('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
  `created_at` timestamp DEFAULT (current_timestamp),
  FOREIGN KEY (`order_id`) REFERENCES `Orders` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`)
);

-- Add some indexes for better performance
ALTER TABLE `Users` ADD INDEX (`email`);
ALTER TABLE `Products` ADD INDEX (`category_id`);
ALTER TABLE `Carts` ADD INDEX (`user_id`);
ALTER TABLE `Wishlists` ADD INDEX (`user_id`);
ALTER TABLE `Orders` ADD INDEX (`user_id`);
ALTER TABLE `OrderItems` ADD INDEX (`order_id`);
ALTER TABLE `Reviews` ADD INDEX (`product_id`);
ALTER TABLE `Transactions` ADD INDEX (`order_id`);
