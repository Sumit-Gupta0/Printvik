/**
 * Razorpay Payment Integration
 * Handle online payment processing
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order
 */
const createRazorpayOrder = async (amount, orderId) => {
    try {
        const options = {
            amount: amount * 100, // amount in paise
            currency: 'INR',
            receipt: orderId,
            notes: {
                orderId: orderId,
            },
        };

        const order = await razorpay.orders.create(options);
        return {
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
            },
        };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Verify Razorpay payment signature
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    try {
        const text = orderId + '|' + paymentId;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generated_signature === signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Get payment details from Razorpay
 */
const getPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            success: true,
            data: payment,
        };
    } catch (error) {
        console.error('Error fetching payment details:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Process refund
 */
const processRefund = async (paymentId, amount) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount * 100, // amount in paise
        });

        return {
            success: true,
            data: refund,
        };
    } catch (error) {
        console.error('Refund processing error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpaySignature,
    getPaymentDetails,
    processRefund,
};
