import axios from 'axios';

async function testRootCount() {
  try {
    const response = await axios.get('http://localhost:5000/api/v1/categories/root');
    console.log(`Total root categories: ${response.data.length}`);
    console.log('\nCategories:');
    response.data.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat.name} (hasChildren: ${cat.hasChildren})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRootCount();
