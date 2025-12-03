/**
 * Payment Controller
 * Handles Razorpay payment integration and COD
 */

const Order = require('../models/Order');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../utils/razorpayService');

/**
 * Create Razorpay order
 * @route POST /api/payments/create-order
 */
exports.createOrder = async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        const result = await createRazorpayOrder(amount, orderId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error creating payment order',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order',
            error: error.message
        });
    }
};

/**
 * Verify Razorpay payment
 * @route POST /api/payments/verify
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Verify signature using service
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            // Payment verified successfully
            const order = await Order.findByIdAndUpdate(
                orderId,
                {
                    paymentStatus: 'completed',
                    paymentId: razorpay_payment_id,
                    orderStatus: 'processing'
                },
                { new: true }
            );

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: { order }
            });
        } else {
            // Invalid signature
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'failed'
            });

            res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

/**
 * Confirm COD order
 * @route POST /api/payments/cod-confirm
 */
exports.confirmCOD = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: 'pending',
                orderStatus: 'processing',
                codAmount: req.body.amount
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'COD order confirmed',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error confirming COD order',
            error: error.message
        });
    }
};
