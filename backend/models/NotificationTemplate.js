/**
 * Notification Template Model
 * Stores templates for all notification events with multi-channel support
 */

const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
    // Unique identifier for the event
    eventKey: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },

    // Human-readable description for admin reference
    description: {
        type: String,
        required: true
    },

    // Multi-channel configuration
    channels: {
        sms: {
            isEnabled: {
                type: Boolean,
                default: false
            },
            template: {
                type: String,
                default: ''
            }
        },
        email: {
            isEnabled: {
                type: Boolean,
                default: false
            },
            subject: {
                type: String,
                default: ''
            },
            body: {
                type: String,
                default: ''
            }
        },
        push: {
            isEnabled: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            body: {
                type: String,
                default: ''
            }
        },
        inApp: {
            isEnabled: {
                type: Boolean,
                default: false
            },
            message: {
                type: String,
                default: ''
            }
        }
    },

    // Available variables for template replacement
    // e.g., ["userName", "orderId", "amount"]
    variables: [{
        type: String
    }],

    // Active status
    isActive: {
        type: Boolean,
        default: true
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

// Update timestamp on save
notificationTemplateSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
