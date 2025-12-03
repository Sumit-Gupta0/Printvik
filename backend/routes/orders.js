/**
 * Order Routes
 * Handles order creation, tracking, and management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const orderController = require('../controllers/orderController');

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', protect, upload.array('documents', 5), orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', protect, orderController.getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', protect, orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Operator/Delivery/Admin)
 */
router.put('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;
