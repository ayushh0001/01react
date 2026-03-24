import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Seed sample categories for e-commerce
 */
async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...\n');

    // Check if categories already exist
    const checkQuery = 'SELECT COUNT(*) as count FROM categories';
    const checkResult = await pool.query(checkQuery);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log('⚠️  Categories already exist. Skipping seed.');
      console.log(`   Found ${checkResult.rows[0].count} categories in database.`);
      process.exit(0);
    }

    // Category structure
    const categories = [
      {
        name: 'Electronics',
        children: [
          {
            name: 'Mobile Phones',
            children: ['Smartphones', 'Feature Phones', 'Accessories']
          },
          {
            name: 'Laptops & Computers',
            children: ['Laptops', 'Desktops', 'Tablets', 'Accessories']
          },
          {
            name: 'Audio & Video',
            children: ['Headphones', 'Speakers', 'Cameras', 'TV & Home Theater']
          }
        ]
      },
      {
        name: 'Fashion',
        children: [
          {
            name: 'Men',
            children: ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Watches']
          },
          {
            name: 'Women',
            children: ['Dresses', 'Tops', 'Jeans', 'Shoes', 'Jewelry']
          },
          {
            name: 'Kids',
            children: ['Boys Clothing', 'Girls Clothing', 'Toys']
          }
        ]
      },
      {
        name: 'Home & Kitchen',
        children: [
          {
            name: 'Furniture',
            children: ['Beds', 'Sofas', 'Tables', 'Chairs']
          },
          {
            name: 'Kitchen Appliances',
            children: ['Mixer Grinders', 'Microwaves', 'Refrigerators']
          },
          {
            name: 'Home Decor',
            children: ['Wall Art', 'Lighting', 'Curtains']
          }
        ]
      },
      {
        name: 'Books & Stationery',
        children: [
          {
            name: 'Books',
            children: ['Fiction', 'Non-Fiction', 'Educational']
          },
          {
            name: 'Stationery',
            children: ['Notebooks', 'Pens', 'Art Supplies']
          }
        ]
      },
      {
        name: 'Sports & Fitness',
        children: [
          {
            name: 'Fitness Equipment',
            children: ['Dumbbells', 'Yoga Mats', 'Treadmills']
          },
          {
            name: 'Sports Gear',
            children: ['Cricket', 'Football', 'Badminton']
          }
        ]
      }
    ];

    let totalInserted = 0;

    // Insert categories
    for (const rootCat of categories) {
      // Insert root category
      const rootQuery = `
        INSERT INTO categories (name, parent_id, is_active)
        VALUES ($1, NULL, true)
        RETURNING id, name
      `;
      const rootResult = await pool.query(rootQuery, [rootCat.name]);
      const rootId = rootResult.rows[0].id;
      totalInserted++;
      console.log(`✅ ${rootCat.name}`);

      // Insert level 2 categories
      if (rootCat.children) {
        for (const level2Cat of rootCat.children) {
          const level2Query = `
            INSERT INTO categories (name, parent_id, is_active)
            VALUES ($1, $2, true)
            RETURNING id, name
          `;
          const level2Result = await pool.query(level2Query, [
            typeof level2Cat === 'string' ? level2Cat : level2Cat.name,
            rootId
          ]);
          const level2Id = level2Result.rows[0].id;
          totalInserted++;
          console.log(`   ├─ ${level2Result.rows[0].name}`);

          // Insert level 3 categories
          if (typeof level2Cat === 'object' && level2Cat.children) {
            for (const level3Cat of level2Cat.children) {
              const level3Query = `
                INSERT INTO categories (name, parent_id, is_active)
                VALUES ($1, $2, true)
                RETURNING id, name
              `;
              await pool.query(level3Query, [level3Cat, level2Id]);
              totalInserted++;
              console.log(`      └─ ${level3Cat}`);
            }
          }
        }
      }
      console.log('');
    }

    console.log(`\n✨ Successfully seeded ${totalInserted} categories!`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

seedCategories();
