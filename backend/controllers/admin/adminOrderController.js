/**
 * Admin Order Controller
 * Handles Order Management, Assignment, Refunds, and File Verification
 */

const Order = require('../../models/Order');
const User = require('../../models/User');
const Ledger = require('../../models/Ledger');
const GlobalSettings = require('../../models/GlobalSettings');
const NotificationService = require('../../services/NotificationService');
const { messaging } = require('../../config/firebase');
const axios = require('axios');
const pdfParse = require('pdf-parse');

exports.getOrders = async (req, res) => {
    try {
        const {
            status,
            orderStatus,
            paymentStatus,
            deliveryOption,
            page = 1,
            limit = 20,
            search
        } = req.query;

        const query = {};

        if (status) query.orderStatus = status;
        if (orderStatus) query.orderStatus = orderStatus;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (deliveryOption) query.deliveryOption = deliveryOption;

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('userId', 'name email phone')
            .populate('assignedOperator', 'name email')
            .populate('assignedDeliveryPerson', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            data: {
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                total: count
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { orderStatus, deliveryStatus, paymentStatus, paymentMethod } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
            order.deliveryStatus = 'cancelled';
            order.auditLog.push({
                action: 'Order Cancelled',
                details: 'Order and delivery cancelled by admin',
                performedBy: req.user._id,
                performedByName: req.user.name,
                timestamp: new Date()
            });
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (deliveryStatus && orderStatus !== 'cancelled') order.deliveryStatus = deliveryStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (paymentMethod) order.paymentMethod = paymentMethod;

        // Financial Split Logic
        if (orderStatus === 'delivered' && order.paymentStatus === 'paid') {
            const existingLedger = await Ledger.findOne({ orderId: order._id });
            if (!existingLedger) {
                let settings = await GlobalSettings.findOne();
                if (!settings) settings = { deliveryRules: { baseFare: 40 }, tax: { gstRate: 18 } };

                const totalAmount = order.totalAmount;
                const deliveryFee = settings.deliveryRules.baseFare;
                const platformFeePercent = 10;
                const platformFee = (totalAmount * platformFeePercent) / 100;
                const shopShare = totalAmount - deliveryFee - platformFee;

                await Ledger.create({
                    entityId: req.user._id,
                    entityType: 'ADMIN',
                    amount: platformFee,
                    type: 'CREDIT',
                    description: `Commission for Order #${order.orderId}`,
                    status: 'SETTLED',
                    orderId: order._id
                });

                if (order.assignedDeliveryPerson) {
                    await Ledger.create({
                        entityId: order.assignedDeliveryPerson,
                        entityType: 'RIDER',
                        amount: deliveryFee,
                        type: 'CREDIT',
                        description: `Delivery Fee for Order #${order.orderId}`,
                        status: 'PENDING',
                        orderId: order._id
                    });
                }

                if (order.items && order.items.length > 0 && order.items[0].shopId) {
                    await Ledger.create({
                        entityId: order.items[0].shopId,
                        entityType: 'OPERATOR',
                        amount: shopShare,
                        type: 'CREDIT',
                        description: `Revenue for Order #${order.orderId}`,
                        status: 'PENDING',
                        orderId: order._id
                    });
                }
            }
        }

        await order.save();
        res.json({ success: true, message: 'Order updated successfully', data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
    }
};

exports.assignDelivery = async (req, res) => {
    try {
        const { orderId, riderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.orderStatus === 'cancelled' || order.orderStatus === 'delivered') {
            return res.status(400).json({ success: false, message: 'Order cannot be assigned in its current status' });
        }

        const rider = await User.findById(riderId);
        if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });
        if (rider.role !== 'delivery') return res.status(400).json({ success: false, message: 'Selected user is not a delivery partner' });

        const activeOrderCount = await Order.countDocuments({
            assignedDeliveryPerson: riderId,
            deliveryStatus: { $in: ['assigned', 'picked-up', 'in-transit'] }
        });

        if (activeOrderCount >= 5) {
            return res.status(400).json({ success: false, message: `Rider is busy (${activeOrderCount} active orders). Max limit is 5.` });
        }

        order.assignedDeliveryPerson = riderId;
        order.deliveryStatus = 'assigned';
        order.orderStatus = 'out_for_delivery';
        order.auditLog.push({
            action: 'Rider Assigned',
            details: `Assigned to ${rider.name} by admin`,
            performedBy: req.user.id,
            timestamp: new Date()
        });
        await order.save();

        rider.activeDeliveries = activeOrderCount + 1;
        await rider.save();

        // Send Notification via Service
        await NotificationService.send('RIDER_ASSIGNED', rider, {
            orderNumber: order.orderNumber,
            shopName: order.assignedOperator?.shopName || 'PrintVik Shop'
        });

        // Populate order to return full object
        const updatedOrder = await Order.findById(orderId)
            .populate('userId', 'name email phone')
            .populate('assignedOperator', 'name email')
            .populate('assignedDeliveryPerson', 'name email');

        res.json({
            success: true,
            message: 'Order assigned successfully',
            data: { order: updatedOrder }
        });
    } catch (error) {
        console.error('Assignment Error:', error);
        res.status(500).json({ success: false, message: 'Error assigning delivery', error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
    }
};

exports.reassignOrder = async (req, res) => {
    try {
        const { newOperatorId, reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Reason is required for reassignment' });

        const order = await Order.findById(req.params.id).populate('assignedOperator', 'name');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const oldOperatorName = order.assignedOperator?.name || 'Unassigned';
        const oldOperatorId = order.assignedOperator?._id?.toString();

        const newOperator = await User.findById(newOperatorId);
        if (!newOperator || newOperator.role !== 'operator') return res.status(400).json({ success: false, message: 'Invalid operator ID' });

        order.assignedOperator = newOperatorId;
        order.auditLog.push({
            action: 'SHOP_REASSIGNED',
            details: `Reassigned from ${oldOperatorName} to ${newOperator.name}`,
            performedBy: req.user.id,
            performedByName: req.user.name,
            reason: reason,
            previousValue: oldOperatorId,
            newValue: newOperatorId,
            timestamp: new Date()
        });

        await order.save();
        res.json({ success: true, message: 'Order reassigned successfully', data: order });
    } catch (error) {
        console.error('Reassign error:', error);
        res.status(500).json({ success: false, message: 'Error reassigning order' });
    }
};

exports.refundOrder = async (req, res) => {
    try {
        const { amount, reason, type = 'FULL' } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Reason is required for refund' });

        const order = await Order.findById(req.params.id).populate('userId');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.paymentStatus === 'refunded') return res.status(400).json({ success: false, message: 'Order already refunded' });

        const refundAmount = type === 'PARTIAL' ? amount : order.totalAmount;
        if (type === 'PARTIAL' && (!amount || amount <= 0 || amount > order.totalAmount)) {
            return res.status(400).json({ success: false, message: 'Invalid refund amount' });
        }

        const user = await User.findById(order.userId._id);
        user.walletBalance = (user.walletBalance || 0) + refundAmount;
        await user.save();

        const previousPaymentStatus = order.paymentStatus;
        order.paymentStatus = 'refunded';
        order.auditLog.push({
            action: 'REFUND_ISSUED',
            details: `${type} refund of ₹${refundAmount} issued to wallet`,
            performedBy: req.user.id,
            performedByName: req.user.name,
            reason: reason,
            previousValue: previousPaymentStatus,
            newValue: 'refunded',
            timestamp: new Date()
        });

        await order.save();
        res.json({
            success: true,
            message: `Refunded ₹${refundAmount} to user wallet`,
            data: { refundAmount, type, newWalletBalance: user.walletBalance }
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ success: false, message: 'Error processing refund' });
    }
};

exports.verifyOrderFile = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (!order.documents || order.documents.length === 0) return res.status(400).json({ success: false, message: 'No documents found' });

        const document = order.documents[0];
        if (!document.url) return res.status(400).json({ success: false, message: 'Document URL not found' });

        try {
            const response = await axios.get(document.url, { responseType: 'arraybuffer', timeout: 10000 });
            const pdfBuffer = Buffer.from(response.data);
            const pdfData = await pdfParse(pdfBuffer);
            const systemVerified = pdfData.numpages;
            const userClaimed = order.specifications?.pages || order.pageCount?.userClaimed || 0;
            const isMismatch = systemVerified !== userClaimed;

            order.pageCount = {
                userClaimed,
                systemVerified,
                isMismatch,
                verifiedAt: new Date(),
                verifiedBy: req.user.id
            };

            order.auditLog.push({
                action: 'FILE_VERIFIED',
                details: `PDF verified: User claimed ${userClaimed} pages, System detected ${systemVerified} pages`,
                performedBy: req.user.id,
                performedByName: req.user.name,
                reason: isMismatch ? 'Page count mismatch detected' : 'Verification successful',
                previousValue: userClaimed.toString(),
                newValue: systemVerified.toString(),
                timestamp: new Date()
            });

            await order.save();

            res.json({
                success: true,
                message: isMismatch ? 'Page count mismatch detected!' : 'File verified successfully',
                data: { userClaimed, systemVerified, isMismatch, difference: systemVerified - userClaimed }
            });
        } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            return res.status(500).json({ success: false, message: 'Error parsing PDF file' });
        }
    } catch (error) {
        console.error('File verification error:', error);
        res.status(500).json({ success: false, message: 'Error verifying file' });
    }
};

const { calculateDistance } = require('../../utils/geoUtils');

exports.autoAssign = async (req, res) => {
    try {
        // 1. Find all unassigned orders ready for delivery
        const pendingOrders = await Order.find({
            orderStatus: 'printed', // or 'ready'
            deliveryStatus: 'pending',
            deliveryOption: 'delivery',
            assignedDeliveryPerson: null
        }).populate('assignedOperator');

        if (pendingOrders.length === 0) {
            return res.json({ success: true, message: 'No pending orders to assign', data: { assignedCount: 0 } });
        }

        // 2. Find all available riders
        const availableRiders = await User.find({
            role: 'delivery',
            isAvailable: true,
            isActive: true,
            activeDeliveries: { $lt: 5 } // Max capacity
        });

        if (availableRiders.length === 0) {
            return res.status(400).json({ success: false, message: 'No available riders found' });
        }

        let assignedCount = 0;
        const assignments = [];

        // 3. Loop through orders and find best rider
        for (const order of pendingOrders) {
            if (!order.assignedOperator?.operatorLocation?.lat) continue;

            let bestRider = null;
            let minDistance = Infinity;

            for (const rider of availableRiders) {
                // Skip if rider is full (double check)
                if (rider.activeDeliveries >= 5) continue;

                // Calculate distance from Rider (or Shop) to Order Pickup
                // Ideally we track Rider Location. For now, assume Rider is at their last known location or Shop
                // If rider location is unknown, we can't optimize by distance effectively, so we might skip or round-robin.
                // Let's assume we have rider.currentLocation
                if (rider.currentLocation?.lat) {
                    const dist = calculateDistance(
                        rider.currentLocation.lat,
                        rider.currentLocation.lng,
                        order.assignedOperator.operatorLocation.lat,
                        order.assignedOperator.operatorLocation.lng
                    );
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestRider = rider;
                    }
                } else {
                    // Fallback: Assign to first available if no location data
                    if (!bestRider) bestRider = rider;
                }
            }

            if (bestRider) {
                // Assign
                order.assignedDeliveryPerson = bestRider._id;
                order.deliveryStatus = 'assigned';
                order.orderStatus = 'out_for_delivery';
                order.auditLog.push({
                    action: 'AUTO_ASSIGNED',
                    details: `Auto-assigned to ${bestRider.name}`,
                    performedBy: req.user._id,
                    timestamp: new Date()
                });
                await order.save();

                bestRider.activeDeliveries += 1;
                await bestRider.save();

                // Notify Rider
                await NotificationService.send('RIDER_ASSIGNED', bestRider, {
                    orderNumber: order.orderNumber,
                    shopName: order.assignedOperator.shopName
                });

                assignments.push({ orderId: order.orderNumber, rider: bestRider.name });
                assignedCount++;
            }
        }

        res.json({
            success: true,
            message: `${assignedCount} orders auto-assigned`,
            data: { assignedCount, assignments }
        });

    } catch (error) {
        console.error('Auto-assign error:', error);
        res.status(500).json({ success: false, message: 'Error running auto-assign', error: error.message });
    }
};
