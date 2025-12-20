const CartModel = require("../Model/cartModel");
const ProductModel = require("../Model/productModel");

// GET /users/cart - View cart items
const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cartItems = await CartModel.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 });

    // Calculate totals and check availability
    let totalItems = 0;
    let totalAmount = 0;
    let hasUnavailableItems = false;
    let hasPriceChanges = false;

    const cart = cartItems.map(item => {
      const product = item.productId;
      const currentPrice = product.price;
      const isAvailable = product.quantity > 0;
      const priceChanged = item.priceAtAdd !== currentPrice;

      totalItems += item.quantity;
      totalAmount += item.quantity * currentPrice;

      if (!isAvailable) hasUnavailableItems = true;
      if (priceChanged) hasPriceChanges = true;

      return {
        cartItemId: item._id,
        productId: product._id,
        product: product,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        isAvailable,
        timeStamp: item.createdAt
      };
    });

    res.status(200).json({
      cart,
      totalItems,
      totalAmount,
      hasUnavailableItems,
      hasPriceChanges
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /users/cart - Add product to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    // Check if product exists and get current price
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if item already exists in cart
    const existingItem = await CartModel.findOne({ userId, productId });
    if (existingItem) {
      return res.status(200).json({ message: "Product already added to cart" });
    } else {
      // Create new cart item
      const cartItem = new CartModel({
        userId,
        productId,
        quantity,
        priceAtAdd: product.price
      });
      await cartItem.save();
    }

    res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /users/cart/:productId - Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cartItem = await CartModel.findOne({ userId, productId });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /users/cart/:productId - Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    await CartModel.findOneAndDelete({ userId, productId });
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /users/cart - Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    await CartModel.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};