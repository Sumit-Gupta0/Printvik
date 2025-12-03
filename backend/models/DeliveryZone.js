/**
 * Delivery Zone Model
 * Defines serviceable areas and delivery availability
 */

const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pincode', 'locality', 'radius'],
        required: true
    },
    // For pincode type
    pincodes: [String],

    // For locality type
    localities: [String],

    // For radius type
    centerLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    radiusKm: Number,

    // Delivery availability
    deliveryAvailable: {
        type: Boolean,
        default: true
    },

    // Pricing for this zone
    deliveryCharge: Number,
    estimatedDeliveryTime: String, // e.g., "2-3 hours", "Same day"

    isActive: {
        type: Boolean,
        default: true
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

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
