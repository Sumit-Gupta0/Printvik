/**
 * Notification Log Model
 * Tracks all sent notifications for audit trail and debugging
 */

const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
    // Recipient information
    recipient: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        phone: String,
        email: String,
        fcmToken: String
    },

    // Event that triggered this notification
    event: {
        type: String,
        required: true,
        index: true
    },

    // Which channels were attempted
    channelsSent: [{
        type: String,
        enum: ['SMS', 'EMAIL', 'PUSH', 'IN_APP']
    }],

    // Overall status
    status: {
        type: String,
        enum: ['SUCCESS', 'PARTIAL_FAILURE', 'FAILED'],
        required: true,
        index: true
    },

    // Detailed metadata about delivery
    metadata: {
        sms: {
            sent: Boolean,
            provider: String,
            messageId: String,
            error: String
        },
        email: {
            sent: Boolean,
            provider: String,
            messageId: String,
            error: String
        },
        push: {
            sent: Boolean,
            provider: String,
            messageId: String,
            error: String
        },
        inApp: {
            sent: Boolean,
            error: String
        }
    },

    // Template data used
    templateData: {
        type: Object
    },

    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
notificationLogSchema.index({ 'recipient.userId': 1, createdAt: -1 });
notificationLogSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
