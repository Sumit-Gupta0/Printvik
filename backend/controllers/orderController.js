/**
 * Order Controller
 * Handles order creation, tracking, and management
 */

const Order = require('../models/Order');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               specifications:
 *                 type: string
 *               instructions:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [online, cod]
 *               deliveryOption:
 *                 type: string
 *                 enum: [pickup, delivery]
 *               deliveryAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 */
exports.createOrder = async (req, res) => {
    try {
        const {
            specifications,
            instructions,
            totalAmount,
            platformFee,
            deliveryCharge,
            paymentMethod,
            deliveryOption,
            deliveryAddress,
            couponCode
        } = req.body;

        // Process uploaded files with page counting
        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = await Promise.all(req.files.map(async (file) => {
                let pageCount = 0;

                // If it's a PDF, count pages
                if (file.mimetype === 'application/pdf') {
                    try {
                        const filePath = path.join(__dirname, '../uploads', file.filename);
                        const dataBuffer = fs.readFileSync(filePath);
                        const data = await pdfParse(dataBuffer);
                        pageCount = data.numpages;
                    } catch (pdfError) {
                        console.error('Error parsing PDF:', pdfError);
                        // Fallback to 1 or 0 if parsing fails
                        pageCount = 1;
                    }
                } else {
                    // For images/docs, default to 1 for now
                    pageCount = 1;
                }

                return {
                    filename: file.originalname,
                    url: `/uploads/${file.filename}`,
                    fileType: file.mimetype,
                    pageCount: pageCount
                };
            }));
        }

        // Process items if present
        let parsedItems = [];
        if (req.body.items) {
            try {
                parsedItems = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
            } catch (e) {
                console.error('Error parsing items:', e);
            }
        }

        // Determine Order Type
        let orderType = 'service';
        if (req.body.orderType === 'WALK_IN') {
            orderType = 'WALK_IN';
        } else if (documents.length > 0 && parsedItems.length > 0) {
            orderType = 'mixed';
        } else if (parsedItems.length > 0) {
            orderType = 'product';
        }

        // Create order
        const orderData = {
            userId: req.user.id,
            documents,
            items: parsedItems,
            orderType,
            specifications: specifications && specifications !== 'undefined' ? JSON.parse(specifications) : undefined,
            instructions,
            totalAmount,
            platformFee,
            deliveryCharge: orderType === 'WALK_IN' ? 0 : deliveryCharge,
            paymentMethod,
            deliveryOption: orderType === 'WALK_IN' ? 'pickup' : deliveryOption,
            deliveryAddress: deliveryOption === 'delivery' && orderType !== 'WALK_IN' && deliveryAddress && deliveryAddress !== 'undefined' ? JSON.parse(deliveryAddress) : null,
            discount: couponCode && couponCode !== 'undefined' ? { couponCode } : null
        };

        if (orderType === 'WALK_IN') {
            if (req.body.operatorId) {
                orderData.assignedOperator = req.body.operatorId;
                orderData.orderStatus = 'printed'; // As per prompt: "Ready to Print" state immediately
            }
        }

        let order;
        if (req.body.draftOrderId) {
            // Find existing draft and update it
            order = await Order.findByIdAndUpdate(req.body.draftOrderId, {
                $set: {
                    ...orderData,
                    documents: undefined // we handle push manually
                },
                $push: { documents: { $each: orderData.documents } }
            }, { new: true });
        } else {
            order = await Order.create(orderData);
        }

        // Send order confirmation notification
        try {
            const user = await User.findById(req.user.id);
            await NotificationService.send('ORDER_PLACED', user, {
                name: user.name,
                orderNumber: order.orderNumber || order._id,
                amount: order.totalAmount,
                trackingLink: `https://printvik.com/track/${order.orderNumber || order._id}`
            });

            // Emit socket event for Walk-in orders
            if (orderType === 'WALK_IN' && order.assignedOperator) {
                NotificationService.emitToRoom(
                    `operator_${order.assignedOperator}`,
                    'new_walkin_order',
                    order
                );
            }
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
            // Don't fail the order creation if notification fails
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { userId: req.user.id };
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('assignedOperator', 'name phone')
            .populate('assignedDeliveryPerson', 'name phone');

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            data: {
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

exports.getDraftOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ userId: req.user.id, orderStatus: 'pending' }).sort({ createdAt: -1 });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No pending draft order found'
            });
        }
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching draft order',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get single order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('assignedOperator', 'name phone operatorLocation')
            .populate('assignedDeliveryPerson', 'name phone vehicleType');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user has access to this order
        if (
            order.userId._id.toString() !== req.user.id &&
            order.assignedOperator?._id.toString() !== req.user.id &&
            order.assignedDeliveryPerson?._id.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }



        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
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
 *               orderStatus:
 *                 type: string
 *               deliveryStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, deliveryStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update status based on user role
        if (orderStatus) order.orderStatus = orderStatus;
        if (deliveryStatus) order.deliveryStatus = deliveryStatus;

        await order.save();

        // Send status update notification
        try {
            const user = await User.findById(order.userId);
            if (orderStatus && orderStatus !== order.orderStatus) {
                await NotificationService.send('ORDER_STATUS_UPDATED', user, {
                    orderNumber: order.orderNumber || order._id,
                    status: orderStatus
                });
            }
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};
