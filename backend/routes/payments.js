/**
 * Payment Routes
 * Handles Razorpay payment integration and COD
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, paymentController.createOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify', protect, paymentController.verifyPayment);

/**
 * @route   POST /api/payments/cod-confirm
 * @desc    Confirm COD order
 * @access  Private
 */
router.post('/cod-confirm', protect, paymentController.confirmCOD);

module.exports = router;
