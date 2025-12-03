// Database Migration Script - Fix Cancelled Orders Delivery Status
// Run this once to update all existing cancelled orders

const mongoose = require('mongoose');
const Order = require('../models/Order');

async function fixCancelledOrders() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Find all cancelled orders with non-cancelled delivery status
        const cancelledOrders = await Order.find({
            orderStatus: 'cancelled',
            deliveryStatus: { $ne: 'cancelled' }
        });

        console.log(`📦 Found ${cancelledOrders.length} cancelled orders with incorrect delivery status`);

        // Update each order
        let updated = 0;
        for (const order of cancelledOrders) {
            const oldDeliveryStatus = order.deliveryStatus;
            order.deliveryStatus = 'cancelled';

            // Add audit log entry
            order.auditLog.push({
                action: 'DELIVERY_STATUS_FIXED',
                details: `Delivery status changed from "${oldDeliveryStatus}" to "cancelled" (migration script)`,
                performedBy: null,
                performedByName: 'System Migration',
                reason: 'Order was cancelled but delivery status was not updated',
                previousValue: oldDeliveryStatus,
                newValue: 'cancelled',
                timestamp: new Date()
            });

            await order.save();
            updated++;
            console.log(`✅ Fixed order ${order.orderNumber}: ${oldDeliveryStatus} → cancelled`);
        }

        console.log(`\n🎉 Migration complete! Updated ${updated} orders.`);

        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
fixCancelledOrders();
