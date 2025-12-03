/**
 * Rider Controller
 * Handles delivery partner functionality
 */

const Order = require('../models/Order');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const FinanceService = require('../services/FinanceService');

/**
 * @openapi
 * /api/delivery/active:
 *   get:
 *     summary: Get active deliveries for delivery partner
 *     tags: [Delivery]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active deliveries
 */
exports.getActiveDeliveries = async (req, res) => {
    try {
        const deliveries = await Order.find({
            assignedDeliveryPerson: req.user.id,
            deliveryStatus: { $in: ['assigned', 'picked-up', 'in-transit'] }
        })
            .sort({ createdAt: 1 })
            .populate('userId', 'name phone')
            .populate('assignedOperator', 'name phone operatorLocation');

        res.json({
            success: true,
            data: { deliveries }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active deliveries',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/delivery/{id}/status:
 *   put:
 *     summary: Update delivery status
 *     tags: [Delivery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryStatus:
 *                 type: string
 *                 enum: [picked-up, delivered, failed]
 *               currentLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryStatus, currentLocation } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order || order.assignedDeliveryPerson.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        order.deliveryStatus = deliveryStatus;

        // Update timestamps based on status
        if (deliveryStatus === 'picked-up') {
            order.pickupTime = new Date();
        } else if (deliveryStatus === 'delivered') {
            order.deliveryTime = new Date();
            order.orderStatus = 'delivered';

            // TRIGGER: Financial Split
            await FinanceService.splitPayment(order);

            // TRIGGER: User Notification
            await NotificationService.send('ORDER_DELIVERED', order.userId, {
                orderNumber: order.orderNumber,
                riderName: req.user.name
            });

        } else if (deliveryStatus === 'failed') {
            // Trigger Admin Alert for Failed Delivery
            await NotificationService.sendAdminAlert(
                'WARNING',
                'Delivery Failed',
                `Order #${order.orderNumber} marked as failed by ${req.user.name}.`,
                `/admin/orders/${order._id}`,
                { type: 'ORDER', id: order._id }
            );
        }

        await order.save();

        // Update delivery partner's current location
        if (currentLocation) {
            await User.findByIdAndUpdate(req.user.id, { currentLocation });
        }

        res.json({
            success: true,
            message: 'Delivery status updated',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating delivery status',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/delivery/{id}/proof:
 *   post:
 *     summary: Upload proof of delivery
 *     tags: [Delivery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *               notes:
 *                 type: string
 *               codCollected:
 *                 type: boolean
 *               codAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Proof uploaded successfully
 */
exports.uploadDeliveryProof = async (req, res) => {
    try {
        const { photo, notes, codCollected, codAmount } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                deliveryProof: {
                    photo,
                    notes,
                    timestamp: new Date()
                },
                codCollected: codCollected || false,
                codAmount: codAmount || 0,
                deliveryStatus: 'delivered',
                orderStatus: 'delivered',
                deliveryTime: new Date()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Proof of delivery uploaded',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading proof',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/delivery/availability:
 *   put:
 *     summary: Update delivery partner availability
 *     tags: [Delivery]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated
 */
exports.updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isAvailable },
            { new: true }
        );

        res.json({
            success: true,
            message: `Availability set to ${isAvailable ? 'available' : 'unavailable'}`,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating availability',
            error: error.message
        });
    }
};
