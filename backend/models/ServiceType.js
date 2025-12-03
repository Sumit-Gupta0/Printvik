/**
 * Service Type Model
 * Defines available print services that admin can manage
 */

const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    icon: String, // URL or emoji
    category: {
        type: String,
        default: 'printing'
    },
    turnaroundTime: String, // e.g., "4 Hours", "2 Days"
    isActive: {
        type: Boolean,
        default: true
    },
    // Form Builder Options
    options: [{
        label: String, // e.g., "Paper Size", "Color"
        type: {
            type: String,
            enum: ['DROPDOWN', 'TOGGLE', 'TEXT', 'FILE'],
            default: 'DROPDOWN'
        },
        required: {
            type: Boolean,
            default: false
        },
        values: [{
            name: String, // e.g., "A4", "Color"
            priceModifier: { type: Number, default: 0 } // e.g., 0, 50
        }]
    }],
    // Availability (Marketplace Logic)
    allowedOperators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pricing: {
        basePrice: Number,
        perUnit: {
            type: String,
            enum: ['per-page', 'per-item', 'flat'],
            default: 'per-page'
        },
        // Bulk Pricing Tiers
        bulkTiers: [{
            minQty: Number,
            pricePerUnit: Number
        }],
        additionalCharges: mongoose.Schema.Types.Mixed
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

module.exports = mongoose.model('ServiceType', serviceTypeSchema);
