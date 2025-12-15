const CateogoryModel = require('../Model/categoryModel');

// Get all root (main) categories
const getRootCategories = async (req, res) => {
  try {
    const categories = await CateogoryModel.find({ parent_id: null });
    
    // Add hasChildren flag for each category
    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        const childCount = await CateogoryModel.countDocuments({ parent_id: category._id });
        return {
          _id: category._id,
          name: category.name,
          parent_id: category.parent_id,
          hasChildren: childCount > 0
        };
      })
    );
    
    res.json(categoriesWithChildren);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get children of a category by parent_id
const getChildrenCategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    const categories = await CateogoryModel.find({ parent_id: parentId });
    
    // Add hasChildren flag for each category
    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        const childCount = await CateogoryModel.countDocuments({ parent_id: category._id });
        return {
          _id: category._id,
          name: category.name,
          parent_id: category.parent_id,
          hasChildren: childCount > 0
        };
      })
    );
    
    res.json(categoriesWithChildren);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Optionally: Get full hierarchical tree (advanced)
const getCategoryTree = async (req, res) => {
  try {
    function buildTree(categories, parentId = null) {
      return categories
        .filter(cat => String(cat.parent_id) === String(parentId))
        .map(cat => ({
          ...cat._doc,
          children: buildTree(categories, cat._id)
        }));
    }
    const allCategories = await CateogoryModel.find({});
    const tree = buildTree(allCategories, null);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { getRootCategories, getChildrenCategories, getCategoryTree };