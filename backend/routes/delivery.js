/**
 * Delivery Routes
 * Handles delivery partner functionality
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const riderController = require('../controllers/riderController');

/**
 * @route   GET /api/delivery/active
 * @desc    Get active deliveries for delivery partner
 * @access  Private (Delivery)
 */
router.get('/active', protect, authorize('delivery'), riderController.getActiveDeliveries);

/**
 * @route   PUT /api/delivery/:id/status
 * @desc    Update delivery status
 * @access  Private (Delivery)
 */
router.put('/:id/status', protect, authorize('delivery'), riderController.updateDeliveryStatus);

/**
 * @route   POST /api/delivery/:id/proof
 * @desc    Upload proof of delivery
 * @access  Private (Delivery)
 */
router.post('/:id/proof', protect, authorize('delivery'), riderController.uploadDeliveryProof);

/**
 * @route   PUT /api/delivery/availability
 * @desc    Update delivery partner availability
 * @access  Private (Delivery)
 */
router.put('/availability', protect, authorize('delivery'), riderController.updateAvailability);

module.exports = router;
