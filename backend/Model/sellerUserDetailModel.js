const mongoose = require("mongoose");

const sellerUserDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credential",
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"]
  },
  profileImage: {
    type: String
  },
  personalAddress: {
    type: String,
    required: true,
    trim: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      required: true
    }
  },
  personalPanNo: {
    type: String,
    required: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    },
    language: {
      type: String,
      enum: ["english", "hindi"],
      default: "english"
    }
  },
  kycStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("SellerUserDetail", sellerUserDetailSchema);