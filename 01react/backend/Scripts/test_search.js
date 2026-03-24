import { pool } from '../config/database.js';
import { extractKeywords, generateSearchTags } from '../utils/keywordExtractor.js';

async function testSearch() {
  try {
    console.log('=== Testing Search Feature ===\n');

    // Test 1: Keyword Extraction
    console.log('Test 1: Keyword Extraction');
    const testText = "Men's Slim Fit Cotton Summer Shirt - Perfect for casual weekend outings";
    const extracted = extractKeywords(testText, "Men's Clothing");
    console.log('Input:', testText);
    console.log('Extracted:', JSON.stringify(extracted, null, 2));
    console.log('Tags:', generateSearchTags(extracted));
    console.log('\n---\n');

    // Test 2: Check Database Columns
    console.log('Test 2: Database Schema Check');
    const schemaCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('search_tags', 'search_vector', 'extracted_attributes')
    `);
    console.log('Columns found:', schemaCheck.rows);
    console.log('\n---\n');

    // Test 3: Check Indexes
    console.log('Test 3: Index Check');
    const indexCheck = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'products' 
      AND indexname LIKE '%search%'
    `);
    console.log('Indexes found:', indexCheck.rows.length);
    indexCheck.rows.forEach(idx => console.log(`  - ${idx.indexname}`));
    console.log('\n---\n');

    // Test 4: Sample Products with Search Data
    console.log('Test 4: Products with Search Data');
    const productsCheck = await pool.query(`
      SELECT id, product_name, search_tags, extracted_attributes
      FROM products
      WHERE search_tags IS NOT NULL AND array_length(search_tags, 1) > 0
      LIMIT 3
    `);
    console.log(`Found ${productsCheck.rows.length} products with search data:`);
    productsCheck.rows.forEach(p => {
      console.log(`\n  Product: ${p.product_name}`);
      console.log(`  Tags: ${p.search_tags?.slice(0, 5).join(', ')}...`);
      console.log(`  Attributes: ${Object.keys(p.extracted_attributes || {}).join(', ')}`);
    });
    console.log('\n---\n');

    // Test 5: Full-Text Search Test
    console.log('Test 5: Full-Text Search Test');
    const searchTest = await pool.query(`
      SELECT id, product_name, 
             ts_rank(search_vector, plainto_tsquery('english', 'cotton')) as rank
      FROM products
      WHERE search_vector @@ plainto_tsquery('english', 'cotton')
      ORDER BY rank DESC
      LIMIT 5
    `);
    console.log(`Found ${searchTest.rows.length} products matching "cotton":`);
    searchTest.rows.forEach(p => {
      console.log(`  - ${p.product_name} (rank: ${p.rank.toFixed(4)})`);
    });

    console.log('\n=== All Tests Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSearch();
