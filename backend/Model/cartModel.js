const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credential",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AddProduct",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  priceAtAdd: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate cart items
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);