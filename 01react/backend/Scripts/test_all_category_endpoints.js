import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testAllCategoryEndpoints() {
  console.log('🧪 Testing All Category Endpoints\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Get root categories
    console.log('\n1️⃣ GET /categories/root');
    console.log('-'.repeat(60));
    const rootRes = await axios.get(`${API_BASE}/categories/root`);
    console.log(`✅ Status: ${rootRes.status}`);
    console.log(`✅ Found ${rootRes.data.length} root categories:`);
    rootRes.data.forEach(cat => {
      console.log(`   - ${cat.name} (hasChildren: ${cat.hasChildren})`);
    });

    // Test 2: Get children of Electronics
    console.log('\n2️⃣ GET /categories/:parentId/children (Electronics)');
    console.log('-'.repeat(60));
    const electronicsId = rootRes.data.find(c => c.name === 'Electronics')?._id;
    if (electronicsId) {
      const childrenRes = await axios.get(`${API_BASE}/categories/${electronicsId}/children`);
      console.log(`✅ Status: ${childrenRes.status}`);
      console.log(`✅ Found ${childrenRes.data.length} children:`);
      childrenRes.data.forEach(cat => {
        console.log(`   - ${cat.name} (hasChildren: ${cat.hasChildren})`);
      });
    } else {
      console.log('⚠️  Electronics category not found');
    }

    // Test 3: Get children of Fashion > Men
    console.log('\n3️⃣ GET /categories/:parentId/children (Fashion > Men)');
    console.log('-'.repeat(60));
    const fashionId = rootRes.data.find(c => c.name === 'Fashion')?._id;
    if (fashionId) {
      const fashionChildrenRes = await axios.get(`${API_BASE}/categories/${fashionId}/children`);
      const menId = fashionChildrenRes.data.find(c => c.name === 'Men')?._id;
      if (menId) {
        const menChildrenRes = await axios.get(`${API_BASE}/categories/${menId}/children`);
        console.log(`✅ Status: ${menChildrenRes.status}`);
        console.log(`✅ Found ${menChildrenRes.data.length} children:`);
        menChildrenRes.data.forEach(cat => {
          console.log(`   - ${cat.name} (hasChildren: ${cat.hasChildren})`);
        });
      } else {
        console.log('⚠️  Men category not found');
      }
    } else {
      console.log('⚠️  Fashion category not found');
    }

    // Test 4: Get category tree
    console.log('\n4️⃣ GET /categories/tree');
    console.log('-'.repeat(60));
    const treeRes = await axios.get(`${API_BASE}/categories/tree`);
    console.log(`✅ Status: ${treeRes.status}`);
    console.log(`✅ Category tree structure:`);
    
    const printTree = (categories, indent = '') => {
      categories.forEach(cat => {
        console.log(`${indent}├─ ${cat.name}`);
        if (cat.children && cat.children.length > 0) {
          printTree(cat.children, indent + '│  ');
        }
      });
    };
    
    printTree(treeRes.data);

    // Test 5: Get all categories (flat)
    console.log('\n5️⃣ GET /categories (all categories)');
    console.log('-'.repeat(60));
    const allRes = await axios.get(`${API_BASE}/categories`);
    console.log(`✅ Status: ${allRes.status}`);
    console.log(`✅ Total categories: ${allRes.data.count || allRes.data.length}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAllCategoryEndpoints();
