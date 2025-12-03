/**
 * @file SystemConfig.js
 * @module SystemManagement
 * @description Mongoose model for storing global system configurations, feature flags, and maintenance mode settings.
 * @requires mongoose
 */

const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        default: "GLOBAL_SETTINGS",
        unique: true
    },
    // Maintenance Control
    maintenanceMode: {
        isActive: { type: Boolean, default: false },
        message: { type: String, default: "We are currently upgrading our system to serve you better. We will be back shortly!" }
    },
    // Feature Flags
    features: {
        allowUserLogin: { type: Boolean, default: true },
        allowOperatorLogin: { type: Boolean, default: true },
        enableCod: { type: Boolean, default: true },
        enableOnlinePayment: { type: Boolean, default: true },
        enableNewSignups: { type: Boolean, default: true }
    },
    // Version Control
    appVersions: {
        minAndroidVersion: { type: String, default: "1.0.0" },
        minIosVersion: { type: String, default: "1.0.0" }
    },
    // Financial Settings (Preserved)
    platformCommissionPercent: { type: Number, default: 10 },
    baseDeliveryFee: { type: Number, default: 40 },
    surgeChargeMultiplier: { type: Number, default: 1.0 },

    // File Settings (Preserved)
    maxFileSizeMB: { type: Number, default: 50 },
    allowedFileTypes: { type: [String], default: ['.pdf', '.docx', '.jpg', '.png'] },

    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure only one document exists
systemConfigSchema.statics.getSettings = async function () {
    let settings = await this.findOne({ key: "GLOBAL_SETTINGS" });
    if (!settings) {
        // Try finding with old key just in case
        settings = await this.findOne({ key: "global_settings" });
        if (settings) {
            settings.key = "GLOBAL_SETTINGS";
            await settings.save();
        } else {
            settings = await this.create({ key: "GLOBAL_SETTINGS" });
        }
    }
    return settings;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
