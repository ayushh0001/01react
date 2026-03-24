import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Test orders API queries
 */
async function testOrdersAPI() {
  try {
    console.log('🧪 Testing Orders API Queries...\n');

    // Get seller with ayushkumarsingh8595@gmail.com
    const sellerQuery = `
      SELECT id, name, email, user_role 
      FROM users 
      WHERE email = 'ayushkumarsingh8595@gmail.com'
    `;
    const sellerResult = await pool.query(sellerQuery);

    if (sellerResult.rows.length === 0) {
      console.log('❌ Seller not found');
      process.exit(1);
    }

    const seller = sellerResult.rows[0];
    console.log(`✅ Seller: ${seller.name} (${seller.email})`);
    console.log(`   ID: ${seller.id}\n`);

    // Test the exact query used in getSellerOrders
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.total_amount,
        o.shipping_amount,
        o.tax_amount,
        o.final_amount,
        o.shipping_address,
        o.payment_method,
        o.estimated_delivery,
        o.created_at,
        o.updated_at,
        u.name as customer_name,
        u.email as customer_email,
        u.mobile as customer_phone,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.seller_id = $1
      GROUP BY o.id, u.name, u.email, u.mobile
      ORDER BY o.created_at DESC
    `;

    const ordersResult = await pool.query(ordersQuery, [seller.id]);

    console.log(`📦 Found ${ordersResult.rows.length} orders:\n`);

    ordersResult.rows.forEach((order, index) => {
      console.log(`${index + 1}. ${order.order_number}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Amount: ₹${order.final_amount}`);
      console.log(`   Customer: ${order.customer_name}`);
      console.log(`   Items: ${order.item_count}`);
      console.log(`   Date: ${new Date(order.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // Test dashboard stats query
    console.log('📊 Testing Dashboard Stats Query...\n');

    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN final_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN payment_status = 'paid' THEN final_amount ELSE NULL END) as avg_order_value
      FROM orders
      WHERE seller_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [seller.id]);
    const stats = statsResult.rows[0];

    console.log('Statistics:');
    console.log(`   Total Orders: ${stats.total_orders}`);
    console.log(`   Delivered: ${stats.delivered_orders}`);
    console.log(`   Pending: ${stats.pending_orders}`);
    console.log(`   Cancelled: ${stats.cancelled_orders}`);
    console.log(`   Total Revenue: ₹${parseFloat(stats.total_revenue || 0).toFixed(2)}`);
    console.log(`   Avg Order Value: ₹${parseFloat(stats.avg_order_value || 0).toFixed(2)}`);

    console.log('\n✅ All queries executed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testOrdersAPI();
