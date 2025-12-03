/**
 * Product Model
 * For E-commerce functionality (Stationery, Merch, etc.)
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined to not conflict, but we should enforce uniqueness if present
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    images: [{
        url: String,
        alt: String
    }],

    // Pricing & Financials
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    costPrice: {
        type: Number, // For profit calculation
        min: 0
    },
    taxRate: {
        type: Number, // GST %
        default: 0,
        min: 0
    },
    isTaxApplicable: {
        type: Boolean,
        default: true
    },

    // Inventory Management
    stockQuantity: { // Kept for backward compatibility, sync with inventory.currentStock
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    inventory: {
        currentStock: {
            type: Number,
            default: 0,
            min: 0
        },
        lowStockThreshold: {
            type: Number,
            default: 10
        },
        manageStock: {
            type: Boolean,
            default: true
        },
        locationInWarehouse: { // e.g., "Rack A-2"
            type: String,
            trim: true
        }
    },

    // Variant Logic
    hasVariants: {
        type: Boolean,
        default: false
    },
    variants: [{
        name: { type: String, required: true }, // e.g., "Blue", "XL"
        sku: String,
        stock: { type: Number, default: 0 },
        priceModifier: { type: Number, default: 0 } // +₹10 for this variant
    }],

    // Classification
    category: {
        type: String,
        required: true,
        enum: ['stationery', 'merchandise', 'accessories', 'paper', 'other']
    },
    tags: [String],

    isActive: {
        type: Boolean,
        default: true
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

// Sync stockQuantity with inventory.currentStock on save
productSchema.pre('save', function (next) {
    if (this.isModified('inventory.currentStock')) {
        this.stockQuantity = this.inventory.currentStock;
    } else if (this.isModified('stockQuantity')) {
        this.inventory.currentStock = this.stockQuantity;
    }

    // Auto-generate SKU if missing (simple fallback)
    if (!this.sku && this.name) {
        const random = Math.floor(Math.random() * 1000);
        this.sku = `${this.name.substring(0, 3).toUpperCase()}-${random}`;
    }

    this.updatedAt = Date.now();
    next();
});

// Calculate effective price
productSchema.virtual('effectivePrice').get(function () {
    return this.discountPrice || this.basePrice;
});

// Update timestamp on save
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
