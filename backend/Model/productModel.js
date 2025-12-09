const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credential",
      required: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    deepestCategoryName: {
      type: String,
    },
    categoryPath: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        name: String,
        slug: String,
      },
    ],

    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      min: 0,
    },
images: {
  type: [String],
  required: true
},
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("AddProduct", productSchema);
