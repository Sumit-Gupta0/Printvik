/**
 * Pricing Configuration Model
 * Stores admin-controlled pricing for all services
 */

const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema({
    // Base printing prices (per page)
    blackAndWhite: {
        A4: { type: Number, default: 2 },
        A3: { type: Number, default: 5 },
        Letter: { type: Number, default: 2 }
    },
    color: {
        A4: { type: Number, default: 5 },
        A3: { type: Number, default: 10 },
        Letter: { type: Number, default: 5 }
    },

    // Additional services
    additionalServices: {
        binding: { type: Number, default: 20 },
        lamination: { type: Number, default: 10 },
        urgentDelivery: { type: Number, default: 50 }
    },

    // Delivery charges
    deliveryCharges: {
        baseCharge: { type: Number, default: 30 },
        perKmCharge: { type: Number, default: 5 },
        zones: [{
            name: String,
            flatRate: Number
        }]
    },

    // Platform fee and operator commission
    platformFeePercentage: {
        type: Number,
        default: 15 // 15% platform fee
    },
    operatorCommissionPercentage: {
        type: Number,
        default: 85 // 85% goes to operator
    },

    // Universal Fees & Taxes
    convenienceFee: {
        type: Number,
        default: 0 // Fixed amount in INR
    },
    donationPercentage: {
        type: Number,
        default: 0 // Optional donation percentage
    },
    serviceCharges: {
        type: Number,
        default: 0 // Percentage
    },
    stateGst: {
        type: Number,
        default: 9 // SGST Percentage
    },
    centralGst: {
        type: Number,
        default: 9 // CGST Percentage
    },

    // Discounts
    discounts: [{
        name: String,
        type: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        value: Number,
        minPages: Number,
        isActive: Boolean
    }],

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
