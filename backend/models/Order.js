/**
 * Order Model
 * Handles all print orders with complete workflow tracking
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Order Identification
    orderNumber: {
        type: String,
        unique: true,
        required: false
    },

    // Customer Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Documents (Print Services)
    documents: [{
        filename: String,
        url: String,
        fileType: String,
        pageCount: Number, // Auto-calculated for PDFs
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Store Products (Inventory Model)
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String, // Snapshot of product name
        sku: String,
        variant: {
            name: String,
            sku: String
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: Number, // Unit price at time of order
        total: Number, // quantity * price
        locationInWarehouse: String // Snapshot for Pick List
    }],

    orderType: {
        type: String,
        enum: ['service', 'product', 'mixed', 'WALK_IN'],
        default: 'service'
    },

    // Print Specifications
    specifications: {
        colorType: {
            type: String,
            enum: ['color', 'bw'],
            required: false
        },
        paperSize: {
            type: String,
            enum: ['A4', 'A3', 'Letter', 'Legal'],
            default: 'A4'
        },
        copies: {
            type: Number,
            min: 1,
            required: false
        },
        pages: {
            type: Number,
            min: 1,
            required: false
        },
        binding: {
            type: String,
            enum: ['none', 'staple', 'spiral', 'hardcover']
        },
        serviceTypes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceType'
        }]
    },

    // Customer Instructions
    instructions: String,

    // Pricing
    totalAmount: {
        type: Number,
        required: true
    },
    platformFee: Number,
    deliveryCharge: Number,
    discount: {
        amount: Number,
        couponCode: String
    },

    // Page Count Verification (OMS 2.0)
    pageCount: {
        userClaimed: Number, // What user said during order
        systemVerified: Number, // What backend PDF parser detected
        isMismatch: {
            type: Boolean,
            default: false
        },
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },

    // Financial Breakdown (OMS 2.0)
    financials: {
        shopPayout: Number, // Amount to be paid to operator
        platformCommission: Number, // PrintVik's cut
        deliveryFee: Number, // Delivery partner fee
        taxCollected: Number, // GST/Tax
        netRevenue: Number // Platform's actual profit
    },

    // Payment
    paymentMethod: {
        type: String,
        enum: ['online', 'cod', 'DIRECT_SETTLEMENT'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: String, // Razorpay payment ID

    // Order Status
    orderStatus: {
        type: String,
        enum: [
            'pending',
            'processing',
            'printing',
            'printed',
            'quality-check',
            'ready',
            'assigned-for-delivery',
            'picked-up',
            'in-transit',
            'delivered',
            'cancelled'
        ],
        enum: ['pending', 'processing', 'printed', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Order Priority
    priority: {
        type: String,
        enum: ['normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Assignment
    assignedOperator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDeliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Delivery Information
    deliveryOption: {
        type: String,
        enum: ['pickup', 'delivery'],
        required: true
    },
    deliveryAddress: {
        name: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        location: {
            lat: Number,
            lng: Number
        }
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'failed', 'cancelled']
    },

    // Timing
    estimatedDelivery: Date,
    actualDelivery: Date,
    pickupTime: Date, // When delivery person picks from operator
    deliveryTime: Date, // When delivered to customer

    // Quality Assurance (optional)
    qualityCheckPhotos: [String], // URLs to photos

    // Proof of Delivery
    deliveryProof: {
        photo: String, // URL to delivery photo
        signature: String,
        notes: String,
        timestamp: Date
    },

    // COD Collection
    codAmount: Number,
    codCollected: Boolean,

    // Invoice
    invoiceNumber: String,
    invoiceUrl: String,

    // Audit Log (Enhanced for OMS 2.0)
    auditLog: [{
        action: {
            type: String,
            enum: [
                'ORDER_CREATED',
                'STATUS_CHANGED',
                'PAYMENT_UPDATED',
                'RIDER_ASSIGNED',
                'SHOP_REASSIGNED',
                'REFUND_ISSUED',
                'FILE_VERIFIED',
                'PRICE_ADJUSTED',
                'CANCELLED',
                'DELIVERY_STATUS_FIXED'
            ]
        },
        details: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performedByName: String, // Denormalized for quick display
        reason: String, // Mandatory for manual overrides
        previousValue: String, // For tracking changes (e.g., old status)
        newValue: String, // New value after change
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique order number
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD${Date.now()}${count + 1}`;
    }
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ assignedOperator: 1, orderStatus: 1 });
orderSchema.index({ assignedDeliveryPerson: 1, deliveryStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
