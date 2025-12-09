const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb+srv://zipinpvtltd:pggp8vOYgZw4aTAA@cluster0.c5xczc9.mongodb.net/ZipinDB';
const DB_NAME = 'ZipinDB';
const CATEGORY_COLLECTION = 'categories';

// Slugify function to generate URL-friendly slugs from category names
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// Recursive function to insert categories with slug
// make slug unique by including parent slug
async function insertCategory(db, category, parentId = null, parentSlug = '') {
  const categories = db.collection(CATEGORY_COLLECTION);

  // Generate slug including parent slug for uniqueness
  let baseSlug = slugify(category.name);
  let slug = parentSlug ? `${parentSlug}-${baseSlug}` : baseSlug;

  const existingCategory = await categories.findOne({ slug: slug });

  let categoryId;
  if (existingCategory) {
    categoryId = existingCategory._id;
  } else {
    const insertResult = await categories.insertOne({
      name: category.name,
      parent_id: parentId,
      slug: slug
    });
    categoryId = insertResult.insertedId;
    console.log(`Inserted category '${category.name}' with slug '${slug}' and ID: ${categoryId}`);
  }

  if (category.subcategories && category.subcategories.length > 0) {
    for (const subcategory of category.subcategories) {
      await insertCategory(db, subcategory, categoryId, slug);
    }
  }
}


async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Read categories JSON file
    const dataPath = path.join(__dirname, '../Data/categories.json');
    const categoriesJson = fs.readFileSync(dataPath, 'utf8');
    const categories = JSON.parse(categoriesJson);

    // Insert each top-level category recursively
    for (const category of categories) {
      await insertCategory(db, category, null);
    }
    console.log('Category import completed.');
  } catch (err) {
    console.error('Error importing categories:', err);
  } finally {
    await client.close();
  }
}

main();
