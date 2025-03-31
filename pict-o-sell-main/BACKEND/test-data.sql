USE pict_o_sell;

-- Insert test users with hashed passwords (password is 'password123')
INSERT INTO users (name, email, password, role, phone) VALUES
('John Seller', 'seller@test.com', '$2a$10$6jXRP/L.Qp1g.H7dmqhGkOHSBgPrJx4mxQvV3XAkMmGGfYhBw4NFi', 'seller', '1234567890'),
('Alice Buyer', 'buyer@test.com', '$2a$10$6jXRP/L.Qp1g.H7dmqhGkOHSBgPrJx4mxQvV3XAkMmGGfYhBw4NFi', 'buyer', '9876543210');

-- Insert test products
INSERT INTO products (title, description, price, category_id, seller_id, stock, rating, `condition`, location) VALUES
('MacBook Pro M2', 'Latest MacBook Pro with M2 chip, 16GB RAM, 512GB SSD', 129999.99, 1, 1, 5, 4.8, 'New', 'Mumbai'),
('The Alchemist', 'International bestseller by Paulo Coelho', 299.99, 2, 1, 20, 4.9, 'New', 'Delhi'),
('Nike Air Max', 'Premium running shoes, size available: 7-11', 7999.99, 3, 1, 10, 4.5, 'New', 'Bangalore'),
('Cricket Bat', 'MRF Professional cricket bat', 1999.99, 4, 1, 15, 4.6, 'New', 'Chennai'),
('Study Table', 'Modern design study table with bookshelf', 4999.99, 5, 1, 8, 4.3, 'New', 'Pune'),
('iPhone 14 Pro', '256GB, Midnight Black, 5G enabled', 119999.99, 1, 1, 3, 4.7, 'New', 'Mumbai'),
('Harry Potter Set', 'Complete set of 7 books', 3999.99, 2, 1, 12, 4.9, 'New', 'Delhi'),
('Adidas Track Suit', 'Premium track suit, size: M, L, XL', 2999.99, 3, 1, 25, 4.4, 'New', 'Bangalore');

-- Insert some wishlist items for the buyer
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 1),
(2, 3),
(2, 6);

-- Insert some cart items for the buyer
INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 2, 1),
(2, 4, 2),
(2, 5, 1);
