const mongoose = require("mongoose");

const customerUserDetailSchema = new mongoose.Schema({
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
  accountType: {
    type: String,
    enum: ["basic", "premium"],
    default: "basic"
  },
  kycStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("CustomerUserDetail", customerUserDetailSchema);