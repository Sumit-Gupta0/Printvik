/**
 * Admin Alert Model
 * Stores operational alerts for admin dashboard (Bell icon notifications)
 */

const mongoose = require('mongoose');

const adminAlertSchema = new mongoose.Schema({
    // Alert severity
    type: {
        type: String,
        enum: ['CRITICAL', 'WARNING', 'INFO'],
        required: true,
        index: true
    },

    // Alert title (short)
    title: {
        type: String,
        required: true
    },

    // Alert message (detailed)
    message: {
        type: String,
        required: true
    },

    // Related entity for context
    relatedEntity: {
        type: {
            type: String,
            enum: ['ORDER', 'RIDER', 'OPERATOR', 'USER', 'SYSTEM']
        },
        id: mongoose.Schema.Types.ObjectId
    },

    // Read status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    // Who read it
    readBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // When it was read
    readAt: Date,

    // Deep link to relevant admin page
    link: String,

    // Additional metadata
    metadata: {
        type: Object
    },

    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Indexes for efficient querying
adminAlertSchema.index({ isRead: 1, createdAt: -1 });
adminAlertSchema.index({ type: 1, isRead: 1 });

module.exports = mongoose.model('AdminAlert', adminAlertSchema);
