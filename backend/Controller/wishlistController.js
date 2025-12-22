const WishlistModel = require("../Model/wishlistModel");
const ProductModel = require("../Model/productModel");

// GET /api/v1/wishlist/count - Get wishlist items count
const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await WishlistModel.countDocuments({ userId });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/v1/wishlist - Get wishlist items
const getWishlistItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const wishlistItems = await WishlistModel.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalItems = await WishlistModel.countDocuments({ userId });

    const wishlist = wishlistItems.map(item => item.productId);

    res.status(200).json({
      wishlist,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/v1/wishlist - Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingItem = await WishlistModel.findOne({ userId, productId });
    if (existingItem) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }

    const wishlistItem = new WishlistModel({ userId, productId });
    await wishlistItem.save();

    res.status(200).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/v1/wishlist/:productId - Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    await WishlistModel.findOneAndDelete({ userId, productId });
    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/v1/wishlist/clear - Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    await WishlistModel.deleteMany({ userId });
    res.status(200).json({ message: "Wishlist cleared successfully" });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getWishlistItems,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};