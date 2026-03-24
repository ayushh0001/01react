import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedEarnings() {
  try {
    console.log('🌱 Starting earnings seeding...');

    // Get the seller user (ayushkumarsingh8595@gmail.com)
    const sellerQuery = `
      SELECT id FROM users 
      WHERE email = 'ayushkumarsingh8595@gmail.com' AND user_role = 'seller'
    `;
    const sellerResult = await pool.query(sellerQuery);

    if (sellerResult.rows.length === 0) {
      console.log('❌ Seller not found. Please create a seller account first.');
      return;
    }

    const sellerId = sellerResult.rows[0].id;
    console.log(`✅ Found seller: ${sellerId}`);

    // Get existing orders for this seller
    const ordersQuery = `
      SELECT id, order_number, final_amount 
      FROM orders 
      WHERE seller_id = $1
      LIMIT 10
    `;
    const ordersResult = await pool.query(ordersQuery, [sellerId]);

    if (ordersResult.rows.length === 0) {
      console.log('⚠️  No orders found for this seller. Creating sample earnings without orders...');
      
      // Create sample earnings without actual orders
      const sampleEarnings = [
        { orderNumber: 'ORD-94285', grossAmount: 420.00, status: 'processed' },
        { orderNumber: 'ORD-94284', grossAmount: 1250.00, status: 'pending' },
        { orderNumber: 'ORD-94283', grossAmount: 85.50, status: 'processed' },
        { orderNumber: 'ORD-94282', grossAmount: 210.00, status: 'processed' },
        { orderNumber: 'ORD-94281', grossAmount: 550.00, status: 'pending' }
      ];

      for (const earning of sampleEarnings) {
        const platformFee = earning.grossAmount * 0.05; // 5% platform fee
        const paymentGatewayFee = earning.grossAmount * 0.02; // 2% payment gateway fee
        const gstAmount = (platformFee + paymentGatewayFee) * 0.18; // 18% GST
        const netAmount = earning.grossAmount - platformFee - paymentGatewayFee - gstAmount;

        const insertQuery = `
          INSERT INTO seller_earnings (
            seller_id,
            order_number,
            gross_amount,
            platform_fee,
            payment_gateway_fee,
            gst_amount,
            net_amount,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `;

        await pool.query(insertQuery, [
          sellerId,
          earning.orderNumber,
          earning.grossAmount,
          platformFee,
          paymentGatewayFee,
          gstAmount,
          netAmount,
          earning.status
        ]);

        console.log(`✅ Created earning for ${earning.orderNumber}: ₹${netAmount.toFixed(2)}`);
      }
    } else {
      console.log(`✅ Found ${ordersResult.rows.length} orders`);

      // Create earnings for existing orders
      for (const order of ordersResult.rows) {
        // Check if earning already exists
        const existingQuery = `
          SELECT id FROM seller_earnings WHERE order_id = $1
        `;
        const existing = await pool.query(existingQuery, [order.id]);

        if (existing.rows.length > 0) {
          console.log(`⏭️  Earning already exists for order ${order.order_number}`);
          continue;
        }

        const grossAmount = parseFloat(order.final_amount);
        const platformFee = grossAmount * 0.05; // 5% platform fee
        const paymentGatewayFee = grossAmount * 0.02; // 2% payment gateway fee
        const gstAmount = (platformFee + paymentGatewayFee) * 0.18; // 18% GST
        const netAmount = grossAmount - platformFee - paymentGatewayFee - gstAmount;

        const insertQuery = `
          INSERT INTO seller_earnings (
            seller_id,
            order_id,
            order_number,
            gross_amount,
            platform_fee,
            payment_gateway_fee,
            gst_amount,
            net_amount,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        await pool.query(insertQuery, [
          sellerId,
          order.id,
          order.order_number,
          grossAmount,
          platformFee,
          paymentGatewayFee,
          gstAmount,
          netAmount,
          Math.random() > 0.5 ? 'processed' : 'pending'
        ]);

        console.log(`✅ Created earning for order ${order.order_number}: ₹${netAmount.toFixed(2)}`);
      }
    }

    console.log('✅ Earnings seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding earnings:', error);
  } finally {
    await pool.end();
  }
}

seedEarnings();
