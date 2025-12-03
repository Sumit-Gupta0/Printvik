/**
 * Operator Payout Model
 * Tracks operator earnings and payment history
 */

const mongoose = require('mongoose');

const operatorPayoutSchema = new mongoose.Schema({
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    orderAmount: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    operatorEarnings: {
        type: Number,
        required: true
    },
    commissionRate: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['bank-transfer', 'upi', 'cash']
    },
    paymentReference: String,
    paidAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
operatorPayoutSchema.index({ operatorId: 1, status: 1 });

module.exports = mongoose.model('OperatorPayout', operatorPayoutSchema);
