const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entityType: {
        type: String,
        enum: ['OPERATOR', 'RIDER', 'ADMIN'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'], // CREDIT = Money added to wallet, DEBIT = Money taken out
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SETTLED'],
        default: 'PENDING'
    },
    transactionRef: {
        type: String // Bank UTR or internal ref
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
