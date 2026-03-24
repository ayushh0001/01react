import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Add orders specifically for ayushkumarsingh8595@gmail.com
 */
async function addOrdersForAyush() {
  try {
    console.log('🌱 Adding orders for ayushkumarsingh8595@gmail.com...\n');

    // Find the seller with this email
    const sellerQuery = `
      SELECT id, name, email, user_role 
      FROM users 
      WHERE email = 'ayushkumarsingh8595@gmail.com'
      LIMIT 1
    `;
    const sellerResult = await pool.query(sellerQuery);

    if (sellerResult.rows.length === 0) {
      console.log('❌ Seller with email ayushkumarsingh8595@gmail.com not found.');
      console.log('Please make sure you have signed up with this email first.');
      process.exit(1);
    }

    const seller = sellerResult.rows[0];
    console.log(`✅ Found seller: ${seller.name} (${seller.email})`);
    console.log(`   Role: ${seller.user_role}`);
    console.log(`   ID: ${seller.id}\n`);

    // Get or create a customer
    let customerQuery = `
      SELECT id, name, email, mobile 
      FROM users 
      WHERE user_role = 'customer' 
      LIMIT 1
    `;
    let customerResult = await pool.query(customerQuery);

    let customer;
    if (customerResult.rows.length === 0) {
      console.log('⚠️  No customer found. Creating a test customer...');
      
      const createCustomerQuery = `
        INSERT INTO users (user_name, name, email, mobile, password_hash, user_role, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, email, mobile
      `;
      
      const customerData = [
        'customer_' + Date.now(),
        'Customer ' + Math.floor(Math.random() * 1000),
        'customer' + Date.now() + '@test.com',
        '98765' + Math.floor(Math.random() * 100000),
        '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        'customer',
        true
      ];
      
      const newCustomerResult = await pool.query(createCustomerQuery, customerData);
      customer = newCustomerResult.rows[0];
      console.log(`✅ Created customer: ${customer.name} (${customer.email})\n`);
    } else {
      customer = customerResult.rows[0];
      console.log(`✅ Found customer: ${customer.name} (${customer.email})\n`);
    }

    // Sample orders data with realistic Indian e-commerce data
    const sampleOrders = [
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 2499.00,
        shipping_amount: 0.00,
        tax_amount: 449.82,
        payment_method: 'razorpay',
        days_ago: 20,
        items: ['Samsung Galaxy Buds', 'Phone Case']
      },
      {
        status: 'shipped',
        payment_status: 'paid',
        total_amount: 1299.00,
        shipping_amount: 50.00,
        tax_amount: 233.82,
        payment_method: 'razorpay',
        days_ago: 2,
        items: ['Wireless Mouse', 'Keyboard']
      },
      {
        status: 'processing',
        payment_status: 'paid',
        total_amount: 3999.00,
        shipping_amount: 0.00,
        tax_amount: 719.82,
        payment_method: 'razorpay',
        days_ago: 1,
        items: ['Smart Watch', 'Fitness Band']
      },
      {
        status: 'pending',
        payment_status: 'pending',
        total_amount: 899.00,
        shipping_amount: 50.00,
        tax_amount: 161.82,
        payment_method: 'cod',
        days_ago: 0,
        items: ['T-Shirt', 'Jeans']
      },
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 5499.00,
        shipping_amount: 0.00,
        tax_amount: 989.82,
        payment_method: 'razorpay',
        days_ago: 15,
        items: ['Laptop Bag', 'USB Hub', 'Mouse Pad']
      },
      {
        status: 'confirmed',
        payment_status: 'paid',
        total_amount: 1799.00,
        shipping_amount: 50.00,
        tax_amount: 323.82,
        payment_method: 'razorpay',
        days_ago: 1,
        items: ['Headphones', 'Cable']
      },
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 999.00,
        shipping_amount: 50.00,
        tax_amount: 179.82,
        payment_method: 'cod',
        days_ago: 25,
        items: ['Water Bottle', 'Gym Bag']
      },
      {
        status: 'shipped',
        payment_status: 'paid',
        total_amount: 4299.00,
        shipping_amount: 0.00,
        tax_amount: 773.82,
        payment_method: 'razorpay',
        days_ago: 3,
        items: ['Bluetooth Speaker', 'Power Bank']
      },
      {
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 1599.00,
        shipping_amount: 50.00,
        tax_amount: 287.82,
        payment_method: 'razorpay',
        days_ago: 10,
        items: ['Shoes', 'Socks']
      },
      {
        status: 'processing',
        payment_status: 'paid',
        total_amount: 2999.00,
        shipping_amount: 0.00,
        tax_amount: 539.82,
        payment_method: 'razorpay',
        days_ago: 0,
        items: ['Tablet Stand', 'Stylus Pen']
      }
    ];

    const shippingAddress = {
      name: customer.name,
      mobile: customer.mobile || '9876543210',
      address_line1: '123 MG Road',
      address_line2: 'Near Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    };

    console.log('📦 Creating orders...\n');

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
        seller.id,  // This is the key - using Ayush's seller ID
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

      // Add order items
      for (let j = 0; j < orderData.items.length; j++) {
        const itemPrice = (orderData.total_amount / orderData.items.length).toFixed(2);
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
          orderData.items[j],
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

      console.log(`✅ ${order.order_number} - ${order.status.toUpperCase().padEnd(12)} - ₹${order.final_amount.toLocaleString('en-IN')}`);
    }

    // Calculate total revenue
    const totalRevenue = sampleOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount + o.shipping_amount + o.tax_amount, 0);

    console.log('\n✨ Successfully created orders!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Seller: ${seller.name} (${seller.email})`);
    console.log(`   - Customer: ${customer.name}`);
    console.log(`   - Orders created: ${sampleOrders.length}`);
    console.log(`   - Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    console.log(`\n🎯 Now login with ${seller.email} to see these orders!`);

  } catch (error) {
    console.error('❌ Error adding orders:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the function
addOrdersForAyush();
