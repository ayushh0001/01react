import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API\n');

  try {
    // Test 1: Get root categories
    console.log('1️⃣ Testing GET /categories/root');
    const rootRes = await axios.get(`${API_BASE}/categories/root`);
    console.log('✅ Root categories:', rootRes.data);
    console.log(`   Found ${rootRes.data.data.length} root categories\n`);

    // Test 2: Get all categories
    console.log('2️⃣ Testing GET /categories');
    const allRes = await axios.get(`${API_BASE}/categories`);
    console.log('✅ All categories:', allRes.data);
    console.log(`   Found ${allRes.data.count} total categories\n`);

    // Test 3: Get children of first category with children
    const categoryWithChildren = rootRes.data.data.find(c => c.hasChildren);
    if (categoryWithChildren) {
      console.log(`3️⃣ Testing GET /categories/${categoryWithChildren._id}/children`);
      const childrenRes = await axios.get(`${API_BASE}/categories/${categoryWithChildren._id}/children`);
      console.log(`✅ Children of "${categoryWithChildren.name}":`, childrenRes.data);
      console.log(`   Found ${childrenRes.data.data.length} child categories\n`);
    }

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCategoriesAPI();
