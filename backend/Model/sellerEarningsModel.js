const mongoose = require("mongoose");

const sellerEarningsSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential',
        required: true
    },
    orderId: {
        type: String, // For now, we'll use string. Later change to ObjectId when Order model exists
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    grossAmount: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    paymentGatewayFee: {
        type: Number,
        required: true
    },
    gstAmount: {
        type: Number,
        required: true
    },
    netAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
    },
    payoutDate: {
        type: Date,
        default: null
    },
    payoutId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now

    }
});

// Update the updatedAt field before saving
sellerEarningsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const SellerEarnings = mongoose.model("SellerEarnings", sellerEarningsSchema);

module.exports = SellerEarnings;



