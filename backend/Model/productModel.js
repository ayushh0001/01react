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
sellerLocation: {
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    match: [/^\d{6}$/, "Pincode must be 6 digits"]
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
},
  },
  {
    timestamp: true,
  }
);

// Create geospatial index for location-based queries
productSchema.index({ "sellerLocation.coordinates": "2dsphere" });

module.exports = mongoose.model("AddProduct", productSchema);
