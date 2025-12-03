/**
 * Admin Stats Controller
 * Handles Analytics, Dashboard Stats, Fleet Status, Logs, and Finance Reports
 */

const Order = require('../../models/Order');
const User = require('../../models/User');
const Ledger = require('../../models/Ledger');
const PaymentSettlement = require('../../models/PaymentSettlement');
const NotificationLog = require('../../models/NotificationLog');
const { calculateDistance, calculateETA } = require('../../utils/geoUtils');

exports.getAnalytics = async (req, res) => {
    try {
        const { period = 'month', compare = 'false', customStart, customEnd } = req.query;

        // Calculate date ranges
        let startDate = new Date();
        let endDate = new Date();
        let compareStartDate, compareEndDate;

        if (customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
        } else if (period === 'today') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'yesterday') {
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        // Calculate comparison period
        if (compare === 'true') {
            const diff = endDate - startDate;
            compareEndDate = new Date(startDate.getTime() - 1);
            compareStartDate = new Date(compareEndDate.getTime() - diff);
        }

        // GMV Data
        const gmvData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    gmv: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Net Revenue
        const netRevenueData = await Ledger.aggregate([
            { $match: { entityType: 'ADMIN', type: 'CREDIT', createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Expenses
        const expenses = await Ledger.aggregate([
            { $match: { type: 'CREDIT', entityType: { $ne: 'ADMIN' }, createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: "$entityType",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        // Conversion Funnel
        const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const paidOrders = await Order.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: startDate, $lte: endDate } });
        const placedOrders = await Order.countDocuments({ orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: startDate, $lte: endDate } });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered', createdAt: { $gte: startDate, $lte: endDate } });

        const conversionFunnel = {
            cartCreated: totalOrders,
            paymentCompleted: paidOrders,
            orderPlaced: placedOrders,
            delivered: deliveredOrders,
            conversionRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0
        };

        // Shop Performance
        const shopPerformance = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: "$assignedOperator",
                    totalOrders: { $sum: 1 },
                    cancelled: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } },
                    delivered: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'shop' } },
            { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ['$shop.name', 'Unassigned'] },
                    email: '$shop.email',
                    totalOrders: 1,
                    rejectionRate: {
                        $cond: [
                            { $gt: ['$totalOrders', 0] },
                            { $multiply: [{ $divide: ['$cancelled', '$totalOrders'] }, 100] },
                            0
                        ]
                    },
                    completionRate: {
                        $cond: [
                            { $gt: ['$totalOrders', 0] },
                            { $multiply: [{ $divide: ['$delivered', '$totalOrders'] }, 100] },
                            0
                        ]
                    },
                    revenue: 1
                }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 }
        ]);

        // Delivery Metrics
        const deliveryMetrics = await Order.aggregate([
            { $match: { orderStatus: 'delivered', deliveredAt: { $exists: true }, createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $project: {
                    deliveryTime: { $divide: [{ $subtract: ['$deliveredAt', '$createdAt'] }, 60000] }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDeliveryTime: { $avg: '$deliveryTime' },
                    minDeliveryTime: { $min: '$deliveryTime' },
                    maxDeliveryTime: { $max: '$deliveryTime' }
                }
            }
        ]);

        // Customer Metrics
        const customerMetrics = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$user', orderCount: { $sum: 1 } } },
            {
                $group: {
                    _id: null,
                    newCustomers: { $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] } },
                    repeatCustomers: { $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] } }
                }
            }
        ]);

        // Product Mix
        const productMix = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$orderType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Top Items
        const topItems = await Order.aggregate([
            { $match: { orderType: 'store_product', createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 10 }
        ]);

        // VIP Customers
        const vipCustomers = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'customer' } },
            { $unwind: '$customer' },
            {
                $project: {
                    name: '$customer.name',
                    email: '$customer.email',
                    phone: '$customer.phone',
                    totalSpent: 1,
                    orderCount: 1
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);

        // Summary
        const totalGMV = gmvData.reduce((sum, d) => sum + d.gmv, 0);
        const totalNetRevenue = netRevenueData.reduce((sum, d) => sum + d.revenue, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
        const netProfit = totalNetRevenue - totalExpenses;

        res.json({
            success: true,
            data: {
                summary: {
                    netProfit,
                    gmv: totalGMV,
                    netRevenue: totalNetRevenue,
                    totalExpenses,
                    activeOrders: placedOrders - deliveredOrders,
                    avgDeliveryTime: deliveryMetrics[0]?.avgDeliveryTime || 0,
                    totalCustomers: (customerMetrics[0]?.newCustomers || 0) + (customerMetrics[0]?.repeatCustomers || 0)
                },
                financial: {
                    gmvTrend: gmvData,
                    netRevenueTrend: netRevenueData,
                    expenses: expenses.map(e => ({ category: e._id, amount: e.total }))
                },
                operational: {
                    conversionFunnel,
                    shopPerformance,
                    deliveryMetrics: deliveryMetrics[0] || { avgDeliveryTime: 0, minDeliveryTime: 0, maxDeliveryTime: 0 }
                },
                growth: {
                    customerMetrics: customerMetrics[0] || { newCustomers: 0, repeatCustomers: 0 },
                    productMix,
                    topItems,
                    vipCustomers
                }
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
    }
};

exports.getFleetStatus = async (req, res) => {
    try {
        const riders = await User.find({ role: 'delivery', isApproved: true }).select('name email phone isActive');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const ridersWithStats = await Promise.all(riders.map(async (rider) => {
            const pendingOrders = await Order.find({
                assignedDeliveryPerson: rider._id,
                orderStatus: { $in: ['printed', 'assigned'] },
                deliveryStatus: { $in: ['pending', 'assigned'] }
            }).populate('assignedOperator', 'name shopName');

            const ongoingOrders = await Order.find({
                assignedDeliveryPerson: rider._id,
                orderStatus: { $in: ['picked-up', 'out_for_delivery'] },
                deliveryStatus: { $in: ['picked-up', 'in-transit'] }
            });

            const deliveredOrders = await Order.find({
                assignedDeliveryPerson: rider._id,
                orderStatus: 'delivered',
                deliveryStatus: 'delivered',
                deliveryTime: { $gte: todayStart }
            });

            const cashInHand = deliveredOrders
                .filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'completed')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            const pendingOrdersDetails = pendingOrders.map(order => {
                const waitingMinutes = Math.floor((new Date() - new Date(order.updatedAt)) / 60000);
                let distance = 0;
                if (order.assignedOperator?.operatorLocation?.lat && order.deliveryAddress?.coordinates?.lat) {
                    distance = calculateDistance(
                        order.assignedOperator.operatorLocation.lat,
                        order.assignedOperator.operatorLocation.lng,
                        order.deliveryAddress.coordinates.lat,
                        order.deliveryAddress.coordinates.lng
                    );
                }
                return {
                    orderId: order.orderNumber,
                    shopName: order.assignedOperator?.shopName || 'Unknown Shop',
                    waitingMinutes,
                    distance: distance > 0 ? distance.toFixed(2) : 0
                };
            });

            const ongoingOrdersDetails = ongoingOrders.map(order => {
                let eta = 5;
                if (order.assignedOperator?.operatorLocation?.lat && order.deliveryAddress?.coordinates?.lat) {
                    const distance = calculateDistance(
                        order.assignedOperator.operatorLocation.lat,
                        order.assignedOperator.operatorLocation.lng,
                        order.deliveryAddress.coordinates.lat,
                        order.deliveryAddress.coordinates.lng
                    );
                    eta = calculateETA(distance);
                }
                return {
                    orderId: order.orderNumber,
                    customerLocation: order.deliveryAddress?.city || 'Unknown',
                    eta,
                    codAmount: order.paymentMethod === 'cod' ? order.totalAmount : 0
                };
            });

            const deliveredOrdersDetails = deliveredOrders.map(order => {
                const timeTaken = order.deliveryTime && order.createdAt
                    ? Math.floor((new Date(order.deliveryTime) - new Date(order.createdAt)) / 60000)
                    : 0;
                return {
                    orderId: order.orderNumber,
                    deliveryTime: order.deliveryTime ? new Date(order.deliveryTime).toLocaleTimeString() : 'N/A',
                    timeTaken
                };
            });

            return {
                riderId: rider._id,
                name: rider.name,
                phone: rider.phone,
                email: rider.email,
                isOnline: rider.isActive || false,
                battery: rider.batteryLevel || 85,
                stats: {
                    pendingCount: pendingOrders.length,
                    activeCount: ongoingOrders.length,
                    deliveredCount: deliveredOrders.length,
                    cashInHand
                },
                pendingOrders: pendingOrdersDetails,
                ongoingOrders: ongoingOrdersDetails,
                deliveredOrders: deliveredOrdersDetails
            };
        }));

        const hotOrders = await Order.find({
            orderStatus: 'printed',
            assignedDeliveryPerson: null,
            deliveryOption: 'delivery'
        }).populate('assignedOperator', 'name shopName').sort({ updatedAt: 1 });

        const hotOrdersFormatted = hotOrders.map(order => {
            const waitingMinutes = Math.floor((new Date() - new Date(order.updatedAt)) / 60000);
            let dropDistance = 0;
            if (order.assignedOperator?.operatorLocation?.lat && order.deliveryAddress?.coordinates?.lat) {
                dropDistance = calculateDistance(
                    order.assignedOperator.operatorLocation.lat,
                    order.assignedOperator.operatorLocation.lng,
                    order.deliveryAddress.coordinates.lat,
                    order.deliveryAddress.coordinates.lng
                );
            }
            return {
                orderId: order.orderNumber,
                _id: order._id,
                status: 'PRINTED',
                shopName: order.assignedOperator?.shopName || order.assignedOperator?.name || 'Unknown Shop',
                shopId: order.assignedOperator?._id,
                shopLat: order.assignedOperator?.operatorLocation?.lat || null,
                shopLng: order.assignedOperator?.operatorLocation?.lng || null,
                waitingMinutes,
                dropDistance: dropDistance > 0 ? dropDistance.toFixed(2) : 0,
                customerCity: order.deliveryAddress?.city || 'Unknown'
            };
        });

        res.json({ success: true, data: { riders: ridersWithStats, hotOrders: hotOrdersFormatted } });
    } catch (error) {
        console.error('Fleet status error:', error);
        res.status(500).json({ success: false, message: 'Error fetching fleet status', error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [
            todayOrders,
            todayGMV,
            activeOrders,
            totalRevenue,
            activeRiders,
            pendingApprovals,
            pipelineStats,
            riderSOS,
            delayedOrders,
            pendingShops,
            activeRidersList
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: todayStart } }),
            Order.aggregate([{ $match: { createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            Order.countDocuments({ orderStatus: { $in: ['pending', 'processing', 'printing', 'ready', 'assigned-for-delivery', 'picked-up', 'in-transit'] } }),
            Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            User.countDocuments({ role: 'delivery', isAvailable: true }),
            User.countDocuments({ role: 'operator', isApproved: false }),
            Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
            User.countDocuments({ role: 'delivery', walletBalance: { $lt: 100 } }),
            Order.countDocuments({ orderStatus: 'pending', createdAt: { $lt: new Date(Date.now() - 15 * 60 * 1000) } }),
            User.countDocuments({ role: 'operator', isApproved: false }),
            User.find({ role: 'delivery', isAvailable: true }).select('name location isAvailable')
        ]);

        const pipeline = { pending: 0, printing: 0, ready: 0, out_for_delivery: 0 };
        pipelineStats.forEach(stat => {
            if (stat._id === 'pending') pipeline.pending = stat.count;
            if (stat._id === 'printing' || stat._id === 'processing') pipeline.printing += stat.count;
            if (stat._id === 'ready') pipeline.ready = stat.count;
            if (stat._id === 'out-for-delivery' || stat._id === 'picked-up' || stat._id === 'in-transit') pipeline.out_for_delivery += stat.count;
        });

        const gmvToday = todayGMV[0]?.total || 0;
        const netEarnings = gmvToday * 0.10;

        const ridersWithLoc = activeRidersList.map(r => ({
            id: r._id,
            name: r.name,
            lat: r.location?.lat || 28.6139 + (Math.random() * 0.01 - 0.005),
            lng: r.location?.lng || 77.2090 + (Math.random() * 0.01 - 0.005),
            status: r.isAvailable ? 'free' : 'busy'
        }));

        res.json({
            success: true,
            data: {
                livePulse: { todayGMV: gmvToday, todayOrders, netEarnings, activeOrders, pendingPayouts: 5400 },
                pipeline,
                actionItems: { kycPending: pendingShops, delayedOrders, disputes: 2, inventoryAlerts: 1, riderSOS },
                riders: ridersWithLoc,
                legacy: { totalRevenue: totalRevenue[0]?.total || 0, activeRiders }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await Order.aggregate([
            { $unwind: "$auditLog" },
            { $sort: { "auditLog.timestamp": -1 } },
            { $limit: 50 },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id",
                    orderNumber: "$orderNumber",
                    action: "$auditLog.action",
                    details: "$auditLog.details",
                    timestamp: "$auditLog.timestamp",
                    performedBy: "$auditLog.performedBy"
                }
            },
            { $lookup: { from: "users", localField: "performedBy", foreignField: "_id", as: "performer" } },
            { $addFields: { performerName: { $arrayElemAt: ["$performer.name", 0] } } },
            { $unset: ["performer", "performedBy"] }
        ]);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({ success: false, message: 'Error fetching logs' });
    }
};

exports.getPayouts = async (req, res) => {
    try {
        const operatorPayouts = await Ledger.aggregate([
            { $match: { entityType: 'OPERATOR', status: 'PENDING' } },
            { $group: { _id: '$entityId', totalAmount: { $sum: '$amount' }, count: { $sum: 1 }, orderIds: { $push: '$orderId' } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $lookup: { from: 'orders', localField: 'orderIds', foreignField: '_id', as: 'orders' } },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    totalAmount: 1,
                    count: 1,
                    userRevenue: {
                        $sum: {
                            $map: {
                                input: '$orders',
                                as: 'order',
                                in: { $add: [{ $ifNull: ['$$order.printingCost', 0] }, { $ifNull: ['$$order.deliveryFee', 0] }] }
                            }
                        }
                    }
                }
            }
        ]);

        const riderPayouts = await Ledger.aggregate([
            { $match: { entityType: 'RIDER', status: 'PENDING' } },
            {
                $group: {
                    _id: '$entityId',
                    totalCredit: { $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] } },
                    totalDebit: { $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] } },
                    count: { $sum: 1 }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    totalCredit: 1,
                    totalDebit: 1,
                    netBalance: { $subtract: ['$totalCredit', '$totalDebit'] }
                }
            }
        ]);

        res.json({ success: true, data: { operators: operatorPayouts, riders: riderPayouts } });
    } catch (error) {
        console.error("Payout Error:", error);
        res.status(500).json({ success: false, message: 'Error fetching payouts' });
    }
};

exports.getSettlements = async (req, res) => {
    try {
        const { entityType, startDate, endDate, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (entityType) query.entityType = entityType;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.settledAt = {};
            if (startDate) query.settledAt.$gte = new Date(startDate);
            if (endDate) query.settledAt.$lte = new Date(endDate);
        }

        const total = await PaymentSettlement.countDocuments(query);
        const settlements = await PaymentSettlement.find(query)
            .populate('entityId', 'name email')
            .populate('settledBy', 'name email')
            .sort({ settledAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const formattedSettlements = settlements.map(s => ({
            _id: s._id,
            entityName: s.entityId?.name || 'Unknown',
            entityEmail: s.entityId?.email,
            entityType: s.entityType,
            amount: s.amount,
            transactionRef: s.transactionRef,
            settledBy: s.settledBy?.name || 'Unknown Admin',
            settledByEmail: s.settledBy?.email,
            settledAt: s.settledAt,
            status: s.status,
            notes: s.notes
        }));

        res.json({
            success: true,
            data: { settlements: formattedSettlements, total, page: parseInt(page), totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Error fetching settlements:', error);
        res.status(500).json({ success: false, message: 'Error fetching settlement history' });
    }
};

exports.getNotificationStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [volumeStats, statusStats, channelStats] = await Promise.all([
            Promise.all([
                NotificationLog.countDocuments({ createdAt: { $gte: today } }),
                NotificationLog.countDocuments({ createdAt: { $gte: lastWeek } }),
                NotificationLog.countDocuments({ createdAt: { $gte: lastMonth } })
            ]),
            NotificationLog.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            NotificationLog.aggregate([{ $unwind: '$channelsSent' }, { $group: { _id: '$channelsSent', count: { $sum: 1 } } }])
        ]);

        const total = statusStats.reduce((acc, curr) => acc + curr.count, 0);
        const failed = statusStats.find(s => s._id === 'FAILED')?.count || 0;
        const partial = statusStats.find(s => s._id === 'PARTIAL_FAILURE')?.count || 0;
        const failureRate = total > 0 ? ((failed + partial) / total * 100).toFixed(1) : 0;

        const channels = channelStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                volume: { today: volumeStats[0], week: volumeStats[1], month: volumeStats[2] },
                performance: { totalSent: total, failedCount: failed + partial, failureRate: parseFloat(failureRate) },
                channels
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
};

exports.getNotificationLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, event } = req.query;
        const query = {};
        if (status) query.status = status;
        if (event) query.event = event;

        const logs = await NotificationLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('recipient.userId', 'name email phone');

        const count = await NotificationLog.countDocuments(query);

        res.json({
            success: true,
            data: { logs, totalPages: Math.ceil(count / limit), currentPage: Number(page), total: count }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, message: 'Error fetching logs' });
    }
};
