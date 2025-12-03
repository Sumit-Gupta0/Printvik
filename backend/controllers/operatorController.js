/**
 * Operator Controller
 * Handles operator-specific functionality
 */

const Order = require('../models/Order');
const User = require('../models/User');
const OperatorPayout = require('../models/OperatorPayout');

/**
 * Get operator's print queue
 * @route GET /api/operators/queue
 */
exports.getPrintQueue = async (req, res) => {
    try {
        const { orderType } = req.query;
        const query = {
            assignedOperator: req.user.id,
            orderStatus: { $in: ['processing', 'printing', 'printed', 'quality-check'] }
        };

        if (orderType) {
            query.orderType = orderType;
        } else {
            // Default behavior: exclude WALK_IN unless explicitly requested?
            // Or just show everything?
            // For now, let's keep it simple. If no orderType is specified, it returns all types.
            // But the "Queue" tab might want to exclude "WALK_IN" if they are separate tabs.
            // Let's assume the frontend will pass orderType='service' (or exclude WALK_IN) for the main tab.
            // Actually, let's make it so if orderType is NOT provided, we exclude WALK_IN to keep the main tab clean?
            // No, let's just support the filter. Frontend can decide.
        }

        const orders = await Order.find(query)
            .sort({ createdAt: 1 })
            .populate('userId', 'name phone');

        res.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching print queue',
            error: error.message
        });
    }
};

/**
 * Get operator earnings dashboard
 * @route GET /api/operators/earnings
 */
exports.getEarnings = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let startDate = new Date();
        if (period === 'day') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const payouts = await OperatorPayout.find({
            operatorId: req.user.id,
            createdAt: { $gte: startDate }
        });

        const totalEarnings = payouts.reduce((sum, p) => sum + p.operatorEarnings, 0);
        const pendingPayouts = payouts.filter(p => p.status === 'pending');
        const paidPayouts = payouts.filter(p => p.status === 'paid');

        res.json({
            success: true,
            data: {
                totalEarnings,
                pendingAmount: pendingPayouts.reduce((sum, p) => sum + p.operatorEarnings, 0),
                paidAmount: paidPayouts.reduce((sum, p) => sum + p.operatorEarnings, 0),
                payouts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings',
            error: error.message
        });
    }
};

/**
 * Update operator availability
 * @route PUT /api/operators/availability
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

/**
 * Update operator service capabilities
 * @route PUT /api/operators/service-capabilities
 */
exports.updateServiceCapabilities = async (req, res) => {
    try {
        const { serviceCapabilities } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { serviceCapabilities },
            { new: true }
        ).populate('serviceCapabilities');

        res.json({
            success: true,
            message: 'Service capabilities updated',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating service capabilities',
            error: error.message
        });
    }
};
