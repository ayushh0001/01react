-- =====================================================
-- SAMPLE SEED DATA FOR TESTING
-- =====================================================

-- Insert sample categories (hierarchical structure)
INSERT INTO categories (id, name, parent_id, description) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Electronics', NULL, 'Electronic devices and accessories'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Fashion', NULL, 'Clothing and accessories'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Home & Kitchen', NULL, 'Home appliances and kitchen items'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Books', NULL, 'Books and stationery');

-- Electronics subcategories
INSERT INTO categories (id, name, parent_id, description) VALUES
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Smartphones', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Mobile phones'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Laptops', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Laptop computers'),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Headphones', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Audio devices');

-- Fashion subcategories
INSERT INTO categories (id, name, parent_id, description) VALUES
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Men', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Men''s clothing'),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Women', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Women''s clothing'),
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 'Kids', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Kids clothing');

-- Men's clothing subcategories
INSERT INTO categories (id, name, parent_id, description) VALUES
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'Shirts', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Men''s shirts'),
('f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', 'T-Shirts', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Men''s t-shirts'),
('a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d', 'Jeans', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Men''s jeans');

-- Sample users (passwords are hashed for 'password123')
-- Customer
INSERT INTO users (id, user_name, name, mobile, email, password_hash, user_role, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', 'john_doe', 'John Doe', '9876543210', 'john@example.com', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX', 'customer', true);

-- Seller
INSERT INTO users (id, user_name, name, mobile, email, password_hash, user_role, is_verified) VALUES
('22222222-2222-2222-2222-222222222222', 'seller_shop', 'Rahul Sharma', '9876543211', 'rahul@example.com', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX', 'seller', true);

-- Delivery Partner
INSERT INTO users (id, user_name, name, mobile, email, password_hash, user_role, is_verified) VALUES
('33333333-3333-3333-3333-333333333333', 'delivery_raj', 'Raj Kumar', '9876543212', 'raj@example.com', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX', 'delivery_partner', true);

-- Customer profile
INSERT INTO customer_profiles (user_id, dob, gender, profile_image) VALUES
('11111111-1111-1111-1111-111111111111', '1990-05-15', 'male', 'https://cloudinary.com/sample_profile.jpg');

-- Seller profile
INSERT INTO seller_profiles (user_id, dob, gender, personal_address, personal_pan_no) VALUES
('22222222-2222-2222-2222-222222222222', '1985-08-20', 'male', '123 Main Street, Mumbai', 'ABCDE1234F');

-- Seller business details with coordinates (Mumbai location)
INSERT INTO seller_business_details (user_id, business_name, business_description, business_type, gst_no, pan_no, address, city, state, pincode, coordinates, is_verified) VALUES
('22222222-2222-2222-2222-222222222222', 'Sharma Electronics', 'Quality electronics at best prices', 'Retail', '27ABCDE1234F1Z5', 'ABCDE1234F', 'Shop 15, Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', ST_SetSRID(ST_MakePoint(72.8294, 19.0544), 4326)::geography, true);

-- Seller bank details
INSERT INTO seller_bank_details (user_id, bank_name, account_no, account_holder_name, account_type, ifsc_code, is_verified) VALUES
('22222222-2222-2222-2222-222222222222', 'HDFC Bank', '12345678901234', 'Rahul Sharma', 'current', 'HDFC0001234', true);

-- Delivery partner profile with location
INSERT INTO delivery_partner_profiles (user_id, dob, gender, personal_address, aadhar_number, driving_license, bank_account_number, ifsc_code, is_online, current_location) VALUES
('33333333-3333-3333-3333-333333333333', '1992-03-10', 'male', '456 Park Road, Mumbai', '123456789012', 'MH0120190012345', '98765432109876', 'ICIC0001234', true, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography);

-- Delivery partner details
INSERT INTO delivery_partner_details (user_id, vehicle_type, vehicle_number, is_verified) VALUES
('33333333-3333-3333-3333-333333333333', 'Motorcycle', 'MH02AB1234', true);

-- Shipping address for customer
INSERT INTO shipping_addresses (user_id, name, phone, address_line1, address_line2, city, state, pincode, landmark, label, coordinates, is_default) VALUES
('11111111-1111-1111-1111-111111111111', 'John Doe', '9876543210', 'Flat 101, Building A', 'Andheri East', 'Mumbai', 'Maharashtra', '400069', 'Near Metro Station', 'Home', ST_SetSRID(ST_MakePoint(72.8697, 19.1136), 4326)::geography, true);

-- Sample products
INSERT INTO products (id, user_id, product_name, description, category_id, deepest_category_name, category_path, price, quantity, in_stock, is_approved) VALUES
('p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Wireless Bluetooth Headphones', 'Premium quality wireless headphones with noise cancellation', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Headphones', '[{"id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", "name": "Electronics"}, {"id": "a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d", "name": "Headphones"}]', 2999.99, 50, true, true),
('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Men''s Cotton T-Shirt', 'Comfortable cotton t-shirt for daily wear', 'f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', 'T-Shirts', '[{"id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e", "name": "Fashion"}, {"id": "b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e", "name": "Men"}, {"id": "f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c", "name": "T-Shirts"}]', 499.99, 100, true, true),
('p3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Smartphone 5G', 'Latest 5G smartphone with 128GB storage', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Smartphones', '[{"id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", "name": "Electronics"}, {"id": "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b", "name": "Smartphones"}]', 24999.99, 25, true, true);

-- Product images
INSERT INTO product_images (product_id, image_url, display_order) VALUES
('p1111111-1111-1111-1111-111111111111', 'https://cloudinary.com/headphones1.jpg', 1),
('p1111111-1111-1111-1111-111111111111', 'https://cloudinary.com/headphones2.jpg', 2),
('p2222222-2222-2222-2222-222222222222', 'https://cloudinary.com/tshirt1.jpg', 1),
('p3333333-3333-3333-3333-333333333333', 'https://cloudinary.com/phone1.jpg', 1),
('p3333333-3333-3333-3333-333333333333', 'https://cloudinary.com/phone2.jpg', 2);

-- Sample product reviews
INSERT INTO product_reviews (product_id, user_id, rating, comment, is_verified_purchase) VALUES
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5, 'Excellent sound quality! Highly recommended.', true),
('p2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 4, 'Good quality fabric, fits well.', true);

-- Sample wishlist
INSERT INTO wishlists (user_id, product_id) VALUES
('11111111-1111-1111-1111-111111111111', 'p3333333-3333-3333-3333-333333333333');

-- Sample cart items
INSERT INTO cart_items (user_id, product_id, quantity, price_at_add) VALUES
('11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 1, 2999.99);

-- Sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, usage_limit) VALUES
('WELCOME10', 'Welcome discount for new users', 'percentage', 10.00, 500.00, 200.00, '2025-01-01', '2025-12-31', 1000);

-- Sample order
INSERT INTO orders (id, order_number, user_id, seller_id, status, payment_status, total_amount, shipping_amount, tax_amount, final_amount, shipping_address, payment_method, payment_id, otp, estimated_delivery, tracking_number) VALUES
('o1111111-1111-1111-1111-111111111111', 'ORD-2025-001234', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'confirmed', 'paid', 2999.99, 50.00, 269.99, 3319.98, '{"name": "John Doe", "phone": "9876543210", "address": "Flat 101, Building A, Andheri East", "city": "Mumbai", "state": "Maharashtra", "pincode": "400069", "landmark": "Near Metro Station", "coordinates": {"type": "Point", "coordinates": [72.8697, 19.1136]}}', 'razorpay', 'pay_razorpay_123456', '1234', '2025-03-15 18:00:00', 'TRK123456789');

-- Order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image) VALUES
('o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Wireless Bluetooth Headphones', 1, 2999.99, 'https://cloudinary.com/headphones1.jpg');

-- Order status history
INSERT INTO order_status_history (order_id, status, note) VALUES
('o1111111-1111-1111-1111-111111111111', 'pending', 'Order placed'),
('o1111111-1111-1111-1111-111111111111', 'confirmed', 'Order confirmed by seller');

-- Payment record
INSERT INTO payments (order_id, user_id, amount, currency, payment_method, gateway_payment_id, gateway_order_id, status) VALUES
('o1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 3319.98, 'INR', 'razorpay', 'pay_razorpay_123456', 'order_razorpay_789', 'success');

-- Seller earnings
INSERT INTO seller_earnings (seller_id, order_id, order_number, gross_amount, platform_fee, payment_gateway_fee, gst_amount, net_amount, status) VALUES
('22222222-2222-2222-2222-222222222222', 'o1111111-1111-1111-1111-111111111111', 'ORD-2025-001234', 2999.99, 149.99, 59.99, 449.99, 2340.02, 'pending');

-- Sample notification
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
('11111111-1111-1111-1111-111111111111', 'Order Confirmed', 'Your order #ORD-2025-001234 has been confirmed', 'order', false),
('22222222-2222-2222-2222-222222222222', 'New Order', 'You have received a new order #ORD-2025-001234', 'order', false);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data insertion
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments;

-- Test geospatial query (find products within 25km of a location)
SELECT 
    p.product_name,
    sbd.business_name,
    sbd.city,
    ROUND(ST_Distance(sbd.coordinates, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography) / 1000, 2) as distance_km
FROM products p
JOIN seller_business_details sbd ON p.user_id = sbd.user_id
WHERE ST_DWithin(
    sbd.coordinates,
    ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography,
    25000
)
ORDER BY distance_km;
