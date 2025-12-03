/**
 * Delivery Zone Routes
 * Check delivery availability by pincode
 */

const express = require('express');
const router = express.Router();
const deliveryZoneController = require('../controllers/deliveryZoneController');

/**
 * @route   GET /api/delivery-zones/check/:pincode
 * @desc    Check if delivery is available for pincode
 * @access  Public
 */
router.get('/check/:pincode', deliveryZoneController.checkDeliveryAvailability);

module.exports = router;
