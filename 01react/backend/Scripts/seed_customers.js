import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const customers = [
  {
    user_name: 'john_doe',
    name: 'John Doe',
    mobile: '9876543210',
    email: 'john.doe@example.com',
    password: 'password123',
    user_role: 'customer'
  },
  {
    user_name: 'jane_smith',
    name: 'Jane Smith',
    mobile: '9876543211',
    email: 'jane.smith@example.com',
    password: 'password123',
    user_role: 'customer'
  },
  {
    user_name: 'mike_johnson',
    name: 'Mike Johnson',
    mobile: '9876543212',
    email: 'mike.johnson@example.com',
    password: 'password123',
    user_role: 'customer'
  },
  {
    user_name: 'sarah_williams',
    name: 'Sarah Williams',
    mobile: '9876543213',
    email: 'sarah.williams@example.com',
    password: 'password123',
    user_role: 'customer'
  },
  {
    user_name: 'david_brown',
    name: 'David Brown',
    mobile: '9876543214',
    email: 'david.brown@example.com',
    password: 'password123',
    user_role: 'customer'
  }
];

async function seedCustomers() {
  try {
    console.log('🌱 Starting customer seeding...');

    for (const customer of customers) {
      // Check if customer already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR mobile = $2',
        [customer.email, customer.mobile]
      );

      if (existingUser.rows.length > 0) {
        console.log(`⏭️  Customer ${customer.name} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(customer.password, 10);

      // Insert customer
      const result = await pool.query(
        `INSERT INTO users (user_name, name, mobile, email, password_hash, user_role, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          customer.user_name,
          customer.name,
          customer.mobile,
          customer.email,
          hashedPassword,
          customer.user_role,
          true, // is_verified
          true  // is_active
        ]
      );

      console.log(`✅ Created customer: ${customer.name} (ID: ${result.rows[0].id})`);
    }

    console.log('\n✨ Customer seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    process.exit(1);
  }
}

seedCustomers();
