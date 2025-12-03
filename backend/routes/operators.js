/**
 * Operator Routes
 * Handles operator-specific functionality
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const operatorController = require('../controllers/operatorController');

/**
 * @route   GET /api/operators/queue
 * @desc    Get operator's print queue
 * @access  Private (Operator)
 */
router.get('/queue', protect, authorize('operator'), operatorController.getPrintQueue);

/**
 * @route   GET /api/operators/earnings
 * @desc    Get operator earnings dashboard
 * @access  Private (Operator)
 */
router.get('/earnings', protect, authorize('operator'), operatorController.getEarnings);

/**
 * @route   PUT /api/operators/availability
 * @desc    Update operator availability
 * @access  Private (Operator)
 */
router.put('/availability', protect, authorize('operator'), operatorController.updateAvailability);

/**
 * @route   PUT /api/operators/service-capabilities
 * @desc    Update operator service capabilities
 * @access  Private (Operator)
 */
router.put('/service-capabilities', protect, authorize('operator'), operatorController.updateServiceCapabilities);

module.exports = router;
