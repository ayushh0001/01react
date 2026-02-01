const mongoose = require("mongoose");

const sellerBankDetailSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credential",
    required: true,
    unique: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNo: {
    type: String,
    required: true,
    trim: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ["savings", "current"]
  },
  ifscCode: {
    type: String,
    required: true,
    match: /^[A-Z]{4}0[A-Z0-9]{6}$/
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("SellerBankDetail", sellerBankDetailSchema);