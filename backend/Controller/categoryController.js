const mongoose = require("mongoose");
const Category = require("../Model/categoryModel");

// Get all root (main) categories
const getRootCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent_id: null });

    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        const childCount = await Category.countDocuments({
          parent_id: category._id,
        });

        return {
          _id: category._id,
          name: category.name,
          parent_id: category.parent_id,
          hasChildren: childCount > 0,
        };
      })
    );

    res.status(200).json(categoriesWithChildren);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get children of a category by parent_id
const getChildrenCategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    const categories = await Category.find({
      parent_id: parentId, // mongoose auto-casts to ObjectId
    });

    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        const childCount = await Category.countDocuments({
          parent_id: category._id,
        });

        return {
          _id: category._id,
          name: category.name,
          parent_id: category.parent_id,
          hasChildren: childCount > 0,
        };
      })
    );

    res.status(200).json(categoriesWithChildren);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get full hierarchical category tree
const getCategoryTree = async (req, res) => {
  try {
    function buildTree(categories, parentId = null) {
      return categories
        .filter(
          (cat) => String(cat.parent_id) === String(parentId)
        )
        .map((cat) => ({
          ...cat._doc,
          children: buildTree(categories, cat._id),
        }));
    }

    const allCategories = await Category.find({});
    const tree = buildTree(allCategories, null);

    res.status(200).json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getRootCategories,
  getChildrenCategories,
  getCategoryTree,
};
