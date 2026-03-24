import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Seed sample orders for testing
 */
async function seedOrders() {
  try {
    console.log('🌱 Starting to seed orders...\n');

    // Get a seller user
    const sellerQuery = `
      SELECT id, name, email 
      FROM users 
      WHERE user_role = 'seller' 
      LIMIT 1
    `;
    const sellerResult = await pool.query(sellerQuery);

    if (sellerResult.rows.length === 0) {
      console.log('❌ No seller found. Please create a seller account first.');
      process.exit(1);
    }

    const seller = sellerResult.rows[0];
    console.log(`✅ Found seller: ${seller.name} (${seller.email})`);

    // Get a customer user
    const customerQuery = `
      SELECT id, name, email, mobile 
      FROM users 
      WHERE user_role = 'customer' 
      LIMIT 1
    `;
    const customerResult = await pool.query(customerQuery);

    let customer;
    if (customerResult.rows.length === 0) {
      console.log('⚠️  No customer found. Creating a test customer...');
      
      const createCustomerQuery = `
        INSERT INTO users (user_name, name, email, mobile, password_hash, user_role, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, email, mobile
      `;
      
      const customerData = [
        'testcustomer',
        'Test Customer',
        'customer@test.com',
        '9876543210',
        '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // dummy hash
        'customer',
        true
      ];
      
      const newCustomerResult = await pool.query(createCustomerQuery, customerData);
      customer = newCustomerResult.rows[0];
      console.log(`✅ Created customer: ${customer.name} (${customer.email})`);
    } else {
      customer = customerResult.rows[0];
      console.log(`✅ Found customer: ${customer.name} (${customer.email})`);
    }

    // Sample orders data
    const sampleOrders = [
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 1299.00,
        shipping_amount: 50.00,
        tax_amount: 233.82,
        payment_method: 'razorpay',
        days_ago: 15
      },
      {
        status: 'shipped',
        payment_status: 'paid',
        total_amount: 2499.00,
        shipping_amount: 0.00,
        tax_amount: 449.82,
        payment_method: 'razorpay',
        days_ago: 3
      },
      {
        status: 'processing',
        payment_status: 'paid',
        total_amount: 899.00,
        shipping_amount: 50.00,
        tax_amount: 161.82,
        payment_method: 'cod',
        days_ago: 1
      },
      {
        status: 'pending',
        payment_status: 'pending',
        total_amount: 1599.00,
        shipping_amount: 50.00,
        tax_amount: 287.82,
        payment_method: 'cod',
        days_ago: 0
      },
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 3299.00,
        shipping_amount: 0.00,
        tax_amount: 593.82,
        payment_method: 'razorpay',
        days_ago: 25
      },
      {
        status: 'cancelled',
        payment_status: 'refunded',
        total_amount: 799.00,
        shipping_amount: 50.00,
        tax_amount: 143.82,
        payment_method: 'razorpay',
        days_ago: 10
      },
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 1899.00,
        shipping_amount: 50.00,
        tax_amount: 341.82,
        payment_method: 'cod',
        days_ago: 20
      },
      {
        status: 'confirmed',
        payment_status: 'paid',
        total_amount: 4599.00,
        shipping_amount: 0.00,
        tax_amount: 827.82,
        payment_method: 'razorpay',
        days_ago: 2
      }
    ];

    const shippingAddress = {
      name: customer.name,
      mobile: customer.mobile || '9876543210',
      address_line1: '123 Main Street',
      address_line2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    };

    console.log('\n📦 Creating orders...\n');

    for (let i = 0; i < sampleOrders.length; i++) {
      const orderData = sampleOrders[i];
      const orderNumber = `ORD${Date.now()}${i}`;
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - orderData.days_ago);

      const finalAmount = orderData.total_amount + orderData.shipping_amount + orderData.tax_amount;

      const insertOrderQuery = `
        INSERT INTO orders (
          order_number,
          user_id,
          seller_id,
          status,
          payment_status,
          total_amount,
          shipping_amount,
          tax_amount,
          final_amount,
          shipping_address,
          payment_method,
          payment_id,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, order_number, status, final_amount
      `;

      const orderValues = [
        orderNumber,
        customer.id,
        seller.id,
        orderData.status,
        orderData.payment_status,
        orderData.total_amount,
        orderData.shipping_amount,
        orderData.tax_amount,
        finalAmount,
        JSON.stringify(shippingAddress),
        orderData.payment_method,
        orderData.payment_method === 'razorpay' ? `pay_${Date.now()}${i}` : null,
        createdAt,
        createdAt
      ];

      const orderResult = await pool.query(insertOrderQuery, orderValues);
      const order = orderResult.rows[0];

      // Add order items (2-3 items per order)
      const itemCount = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < itemCount; j++) {
        const itemPrice = (orderData.total_amount / itemCount).toFixed(2);
        const insertItemQuery = `
          INSERT INTO order_items (
            order_id,
            product_name,
            quantity,
            price,
            image
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        const itemValues = [
          order.id,
          `Product ${j + 1}`,
          1,
          itemPrice,
          'https://via.placeholder.com/150'
        ];

        await pool.query(insertItemQuery, itemValues);
      }

      // Add status history
      const historyQuery = `
        INSERT INTO order_status_history (order_id, status, note, created_at)
        VALUES ($1, $2, $3, $4)
      `;

      await pool.query(historyQuery, [
        order.id,
        orderData.status,
        `Order ${orderData.status}`,
        createdAt
      ]);

      console.log(`✅ Created order: ${order.order_number} - ${order.status} - ₹${order.final_amount}`);
    }

    console.log('\n✨ Successfully seeded orders!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Seller: ${seller.name}`);
    console.log(`   - Customer: ${customer.name}`);
    console.log(`   - Orders created: ${sampleOrders.length}`);

  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedOrders();
