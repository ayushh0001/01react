const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    earningsCount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    bankAccount: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        default: null
    },
    payoutDate: {
        type: Date,
        default: null
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    estimatedPayoutDate: {
        type: Date,
        required: true
    },
    failureReason: {
        type: String,
        default: null
    }
});

const Payout = mongoose.model("Payout", payoutSchema);

module.exports = Payout;