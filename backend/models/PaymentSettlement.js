/**
 * Payment Settlement Model
 * Tracks all settlement payments made to operators and riders
 */

const mongoose = require('mongoose');

const paymentSettlementSchema = new mongoose.Schema({
    // Entity being paid
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    entityType: {
        type: String,
        enum: ['OPERATOR', 'RIDER'],
        required: true,
        index: true
    },

    // Settlement details
    amount: {
        type: Number,
        required: true
    },
    ledgerEntries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger'
    }],
    transactionRef: {
        type: String,
        required: true
    },

    // Admin tracking
    settledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who settled
        required: true
    },
    settledAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    // Status and notes
    status: {
        type: String,
        enum: ['COMPLETED', 'FAILED'],
        default: 'COMPLETED',
        index: true
    },
    notes: String,

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient querying
paymentSettlementSchema.index({ entityId: 1, settledAt: -1 });
paymentSettlementSchema.index({ entityType: 1, status: 1 });

module.exports = mongoose.model('PaymentSettlement', paymentSettlementSchema);
