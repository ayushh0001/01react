import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Hardcoded products data from the website
const products = [
    // --- Fashion (Men & Women) ---
    { id: 1, category: 'Fashion', subcategory: 'Men T-Shirts', image: 'https://plus.unsplash.com/premium_photo-1673356301514-2cad91907f74?q=80&w=687', title: 'The Classic Crew Tshirt', price: 899, description: 'Comfortable cotton crew neck t-shirt for everyday wear' },
    { id: 2, category: 'Fashion', subcategory: 'Men Shorts', image: 'https://media.istockphoto.com/id/1203543686/photo/handsome-guy-with-hat-is-on-the-beach.jpg?s=2048x2048', title: 'AeroFlow Training Shorts', price: 899, description: 'Lightweight training shorts perfect for workouts' },
    { id: 3, category: 'Fashion', subcategory: 'Men Jeans', image: 'https://media.istockphoto.com/id/176405965/photo/facing-the-day-with-a-smile.jpg?s=2048x2048', title: 'The Maverick Slim-Fit Jeans', price: 899, description: 'Stylish slim-fit jeans for a modern look' },
    { id: 4, category: 'Fashion', subcategory: 'Men Ethnic', image: 'https://media.istockphoto.com/id/1614454660/photo/male-model-posing-in-green-kurta.jpg?s=2048x2048', title: 'Emerald Fusion Kurta Set', price: 899, description: 'Traditional kurta set with modern styling' },
    { id: 5, category: 'Fashion', subcategory: 'Women Dresses', image: 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600', title: 'Elegant Maxi Dress', price: 1299, description: 'Flowing maxi dress perfect for special occasions' },
    { id: 6, category: 'Fashion', subcategory: 'Women Tops', image: 'https://plus.unsplash.com/premium_photo-1690038783854-ff651bc9d1d7?w=600', title: 'Classic White Blouse', price: 799, description: 'Versatile white blouse for office and casual wear' },

    // --- Footwear ---
    { id: 10, category: 'Footwear', subcategory: 'Sports Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000', title: 'Running Sports Shoes', price: 1999, description: 'High-performance running shoes with advanced cushioning' },
    { id: 11, category: 'Footwear', subcategory: 'Women Heels', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000', title: 'High Heels', price: 1599, description: 'Elegant high heels for formal occasions' },
    { id: 12, category: 'Footwear', subcategory: 'Women Flats', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000', title: 'Comfortable Flats', price: 899, description: 'All-day comfort flats for everyday wear' },
    { id: 13, category: 'Footwear', subcategory: 'Sneakers', image: 'https://plus.unsplash.com/premium_photo-1710107446916-1b0c67a99042?q=80&w=387', title: 'CloudStride Sneakers', price: 1299, description: 'Trendy sneakers with cloud-like comfort' },

    // --- Accessories (Watches, Jewellery, Bags) ---
    { id: 20, category: 'Accessories', subcategory: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000', title: 'Classic Leather Timepiece', price: 2499, description: 'Timeless leather watch with precision movement' },
    { id: 21, category: 'Accessories', subcategory: 'Watches', image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1000', title: 'Golden Era Analog Watch', price: 5999, description: 'Luxury analog watch with golden finish' },
    { id: 34, category: 'Accessories', subcategory: 'Watches', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000', title: 'Smart Fitness Tracker', price: 1999, description: 'Advanced fitness tracker with health monitoring' },
    { id: 35, category: 'Accessories', subcategory: 'Watches', image: 'https://images.unsplash.com/photo-1619134778706-c27533cdcd7d?q=80&w=1000', title: 'Chronograph Sport Watch', price: 8999, description: 'Professional chronograph for sports enthusiasts' },
    { id: 22, category: 'Accessories', subcategory: 'Jewellery', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc5e?q=80&w=1000', title: 'Gold Plated Hoop Earrings', price: 899, description: 'Elegant gold-plated hoop earrings' },
    { id: 23, category: 'Accessories', subcategory: 'Jewellery', image: 'https://images.unsplash.com/photo-1602751584552-8ba420552259?q=80&w=1000', title: 'Crystal Pendant Necklace', price: 1299, description: 'Beautiful crystal pendant necklace' },
    { id: 36, category: 'Accessories', subcategory: 'Jewellery', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000', title: 'Silver Charm Bracelet', price: 999, description: 'Delicate silver bracelet with charms' },
    { id: 37, category: 'Accessories', subcategory: 'Jewellery', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000', title: 'Solitaire Engagement Ring', price: 2499, description: 'Classic solitaire engagement ring' },
    { id: 24, category: 'Accessories', subcategory: 'Handbags', image: 'https://images.unsplash.com/photo-1713425884368-9079ba200325?q=80&w=411', title: 'Designer Bag', price: 1399, description: 'Stylish designer handbag for all occasions' },

    // --- Beauty (Makeup & Skincare) ---
    { id: 30, category: 'Beauty', subcategory: 'Makeup', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000', title: 'Matte Lipstick Set', price: 999, description: 'Long-lasting matte lipstick collection' },
    { id: 31, category: 'Beauty', subcategory: 'Makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000', title: 'Eye Makeup Palette', price: 1499, description: 'Professional eye makeup palette with vibrant colors' },
    { id: 32, category: 'Beauty', subcategory: 'Skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8103?q=80&w=1000', title: 'Nourishing Face Wash', price: 499, description: 'Gentle face wash for all skin types' },
    { id: 33, category: 'Beauty', subcategory: 'Skincare', image: 'https://images.unsplash.com/photo-1570191065633-db330f24599f?q=80&w=1000', title: 'Hydrating Moisturizer', price: 799, description: 'Deep hydrating moisturizer for soft skin' },

    // --- Home & Living ---
    { id: 40, category: 'Home & Living', subcategory: 'Bedding', image: 'https://images.unsplash.com/photo-1616489953149-75ec06093409?q=80&w=1000', title: 'Luxury Cotton Bedsheet', price: 1299, description: 'Premium cotton bedsheet set for comfortable sleep' },
    { id: 41, category: 'Home & Living', subcategory: 'Bedding', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000', title: 'Soft Woolen Blanket', price: 2499, description: 'Cozy woolen blanket for winter comfort' },
    { id: 42, category: 'Home & Living', subcategory: 'Kitchenware', image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1000', title: 'Non-Stick Cookware Set', price: 3999, description: 'Complete non-stick cookware set for modern kitchens' },
    { id: 43, category: 'Home & Living', subcategory: 'Kitchenware', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1000', title: 'Stainless Steel Knife Set', price: 1499, description: 'Professional knife set for culinary enthusiasts' },

    // --- Gadgets ---
    { id: 50, category: 'Gadgets', subcategory: 'Audio', image: 'https://plus.unsplash.com/premium_photo-1679513691474-73102089c117?q=80&w=813', title: 'Premium Headphones', price: 2499, description: 'High-quality headphones with noise cancellation' },
    { id: 51, category: 'Gadgets', subcategory: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000', title: 'Bluetooth Speaker', price: 1999, description: 'Portable Bluetooth speaker with rich sound' },
    { id: 52, category: 'Gadgets', subcategory: 'Wearables', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000', title: 'Smart Fitness Tracker', price: 1999, description: 'Advanced fitness tracker with health monitoring' },

    // --- Electrical Appliances ---
    { id: 60, category: 'Electrical Appliances', subcategory: 'Large Appliances', image: 'https://images.unsplash.com/photo-1571175432291-fe1458be3d82?q=80&w=1000', title: 'Smart Refrigerator', price: 45999, description: 'Energy-efficient smart refrigerator with advanced features' },
    { id: 61, category: 'Electrical Appliances', subcategory: 'Large Appliances', image: 'https://images.unsplash.com/photo-1626806819282-2c1dc61a0e0c?q=80&w=1000', title: 'Front Load Washing Machine', price: 32499, description: 'High-efficiency front load washing machine' },
    { id: 62, category: 'Electrical Appliances', subcategory: 'Large Appliances', image: 'https://images.unsplash.com/photo-1593115057322-e94b77572f20?q=80&w=1000', title: 'Split Air Conditioner', price: 38999, description: 'Energy-saving split AC with inverter technology' },
    { id: 63, category: 'Electrical Appliances', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000', title: '4K Ultra HD Television', price: 24999, description: 'Crystal clear 4K TV with smart features' },
    { id: 64, category: 'Electrical Appliances', subcategory: 'Kitchen Appliances', image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1000', title: 'Digital Microwave Oven', price: 8499, description: 'Multi-function digital microwave oven' },
    { id: 65, category: 'Electrical Appliances', subcategory: 'Kitchen Appliances', image: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=1000', title: 'Induction Cooktop', price: 2999, description: 'Efficient induction cooktop for modern cooking' },
];

// Category mapping for database
const categoryMapping = {
    'Fashion': {
        'Men T-Shirts': 'men-casual-tshirts',
        'Men Shorts': 'men-casual-shorts', 
        'Men Jeans': 'men-casual-jeans',
        'Men Ethnic': 'men-ethnic-kurtas',
        'Women Dresses': 'women-western-dresses',
        'Women Tops': 'women-western-tops'
    },
    'Footwear': {
        'Sports Shoes': 'men-footwear-sports',
        'Women Heels': 'women-footwear-heels',
        'Women Flats': 'women-footwear-flats',
        'Sneakers': 'footwear-sneakers'
    },
    'Accessories': {
        'Watches': 'accessories-watches',
        'Jewellery': 'accessories-jewellery',
        'Handbags': 'accessories-handbags'
    },
    'Beauty': {
        'Makeup': 'beauty-makeup',
        'Skincare': 'beauty-skincare'
    },
    'Home & Living': {
        'Bedding': 'home-bedding',
        'Kitchenware': 'home-kitchenware'
    },
    'Gadgets': {
        'Audio': 'gadgets-audio',
        'Wearables': 'gadgets-wearables'
    },
    'Electrical Appliances': {
        'Large Appliances': 'electrical-large',
        'Electronics': 'electrical-electronics',
        'Kitchen Appliances': 'electrical-kitchen'
    }
};

async function migrateProducts() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Starting product migration...');
        
        // Create a demo seller user if not exists
        const sellerQuery = `
            INSERT INTO users (user_name, name, email, mobile, password_hash, user_role, is_verified)
            VALUES ('demoseller', 'Demo Seller', 'demo@zpinshop.com', '9999999999', '$2b$10$dummy.hash.for.demo.user', 'seller', true)
            ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `;
        
        const sellerResult = await client.query(sellerQuery);
        const sellerId = sellerResult.rows[0].id;
        console.log(`✅ Demo seller created/found: ${sellerId}`);
        
        // Get or create categories
        const categoryCache = new Map();
        
        for (const product of products) {
            const categoryKey = categoryMapping[product.category]?.[product.subcategory] || 'general';
            
            if (!categoryCache.has(categoryKey)) {
                // Create category if not exists
                const categoryQuery = `
                    INSERT INTO categories (name, description, is_active)
                    VALUES ($1, $2, true)
                    RETURNING id
                `;
                
                try {
                    const categoryResult = await client.query(categoryQuery, [
                        product.subcategory || product.category,
                        `${product.category} - ${product.subcategory || 'General'}`
                    ]);
                    
                    categoryCache.set(categoryKey, categoryResult.rows[0].id);
                    console.log(`📁 Category created: ${product.subcategory || product.category}`);
                } catch (error) {
                    if (error.code === '23505') { // Unique violation
                        // Category already exists, fetch it
                        const existingQuery = `SELECT id FROM categories WHERE name = $1`;
                        const existingResult = await client.query(existingQuery, [
                            product.subcategory || product.category
                        ]);
                        
                        if (existingResult.rows.length > 0) {
                            categoryCache.set(categoryKey, existingResult.rows[0].id);
                            console.log(`📁 Category found: ${product.subcategory || product.category}`);
                        }
                    } else {
                        throw error;
                    }
                }
            }
        }
        
        // Insert products
        let insertedCount = 0;
        
        for (const product of products) {
            const categoryKey = categoryMapping[product.category]?.[product.subcategory] || 'general';
            const categoryId = categoryCache.get(categoryKey);
            
            // Insert product
            const productQuery = `
                INSERT INTO products (
                    user_id, product_name, description, category_id, 
                    deepest_category_name, price, quantity, in_stock, is_approved
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
                RETURNING id
            `;
            
            try {
                const productResult = await client.query(productQuery, [
                    sellerId,
                    product.title,
                    product.description,
                    categoryId,
                    product.subcategory || product.category,
                    product.price,
                    Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
                ]);
                
                if (productResult.rows.length > 0) {
                    const productId = productResult.rows[0].id;
                    
                    // Insert product image
                    const imageQuery = `
                        INSERT INTO product_images (product_id, image_url, display_order)
                        VALUES ($1, $2, 0)
                    `;
                    
                    await client.query(imageQuery, [productId, product.image]);
                    
                    insertedCount++;
                    console.log(`✅ Product inserted: ${product.title} (${insertedCount}/${products.length})`);
                }
            } catch (error) {
                if (error.code === '23505') {
                    console.log(`⚠️ Product already exists: ${product.title}`);
                } else {
                    console.error(`❌ Error inserting product ${product.title}:`, error.message);
                }
            }
        }
        
        console.log(`🎉 Migration completed! Inserted ${insertedCount} products`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run migration
migrateProducts()
    .then(() => {
        console.log('✅ Product migration successful!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Product migration failed:', error);
        process.exit(1);
    });