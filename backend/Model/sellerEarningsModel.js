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
    deliveredDate: {
        type: Date,
        required: true
    },
    withdrawableDate: {
        type: Date,
        required: true
    },
    isWithdrawable: {
        type: Boolean,
        default: false
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

// Set withdrawableDate to 15 days after deliveredDate
sellerEarningsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    if (this.deliveredDate && !this.withdrawableDate) {
        this.withdrawableDate = new Date(this.deliveredDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    }
    
    next();
});

const SellerEarnings = mongoose.model("SellerEarnings", sellerEarningsSchema);

module.exports = SellerEarnings;



