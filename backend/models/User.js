/**
 * User Model
 * Handles all user types: customers, operators, delivery partners, and admins
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false // Don't return password by default
    },

    // User Role
    role: {
        type: String,
        enum: ['user', 'operator', 'delivery', 'admin', 'super_admin', 'support', 'operations'],
        default: 'user'
    },

    // Addresses (for customers)
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],

    // Operator-specific fields
    operatorLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    serviceArea: {
        radius: Number, // in kilometers
        zones: [String] // pincodes or locality names
    },
    maxCapacity: {
        type: Number,
        default: 10 // max concurrent orders
    },
    currentLoad: {
        type: Number,
        default: 0 // current active orders
    },
    skills: [String], // service type IDs operator can handle
    serviceCapabilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceType'
    }],

    // Vendor Management System Fields (for Operators)
    shopDetails: {
        shopName: String,
        ownerName: String,
        address: String,
        location: {
            lat: Number,
            lng: Number
        },
        openingTime: String,
        closingTime: String
    },
    financials: {
        commissionRate: {
            type: Number,
            default: 10 // Default 10% commission
        },
        pendingPayout: {
            type: Number,
            default: 0
        },
        bankDetails: {
            accountName: String,
            accountNumber: String,
            ifsc: String,
            bankName: String
        }
    },
    kyc: {
        aadhaarUrl: String,
        panUrl: String,
        gstUrl: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        rejectionReason: String
    },
    status: {
        isOnline: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    },
    performance: {
        rating: {
            type: Number,
            default: 0
        },
        totalRatings: {
            type: Number,
            default: 0
        },
        rejectionRate: {
            type: Number,
            default: 0
        }
    },

    // Custom Operator Rate Overrides (Admin-configurable)
    operatorRateOverrides: {
        type: Map,
        of: new mongoose.Schema({
            base: Number,
            tier1: Number,
            tier2: Number,
            tier3: Number
        }, { _id: false }),
        default: new Map()
    },

    // Delivery personnel fields
    vehicleType: {
        type: String,
        enum: ['bike', 'car', 'van']
    },
    currentLocation: {
        lat: Number,
        lng: Number
    },
    batteryLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    lastBatteryUpdate: Date,

    // Availability (for operators and delivery)
    isAvailable: {
        type: Boolean,
        default: true
    },

    // Referral tracking (for customers)
    referralCode: String,
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    referralRewards: {
        type: Number,
        default: 0
    },
    referralRewards: {
        type: Number,
        default: 0
    },

    // CRM Fields
    lastLogin: Date,
    totalSpent: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    adminNotes: [{
        text: String,
        author: String, // Admin name
        date: {
            type: Date,
            default: Date.now
        }
    }],
    deviceInfo: {
        appVersion: String,
        os: String, // e.g., 'Android 13', 'iOS 16'
        deviceName: String // e.g., 'Samsung S23'
    },
    isCodBlocked: {
        type: Boolean,
        default: false
    },

    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: function () {
            // End users are approved by default, others need admin approval
            return this.role === 'user';
        }
    },
    verificationDocument: {
        type: String, // URL to the uploaded document
        required: false
    },

    // Admin Security
    encryptedPassword: {
        type: String,
        select: false // Never return by default
    },
    securityPin: {
        type: String, // Hashed PIN for admins
        select: false
    },

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

const { encrypt } = require('../utils/encryption');

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Encrypt password for admin recovery (reversible)
    // We do this BEFORE hashing because hashing destroys the original text
    if (this.password && !this.encryptedPassword) {
        this.encryptedPassword = encrypt(this.password);
    } else if (this.isModified('password')) {
        // If password is being changed, update the encrypted version too
        this.encryptedPassword = encrypt(this.password);
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp on save
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
