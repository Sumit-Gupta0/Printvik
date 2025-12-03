/**
 * @file system.js
 * @module Routes
 * @description Routes for managing system-level configurations (Maintenance Mode, Feature Flags).
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const systemController = require('../controllers/systemController');

/**
 * @route   GET /api/system/config
 * @desc    Get current system configuration
 * @access  Private (Admin/Operations)
 */
router.get('/config', protect, authorize('admin', 'super_admin', 'operations'), systemController.getSettings);

/**
 * @route   PATCH /api/system/config
 * @desc    Update system configuration (Maintenance Mode, Feature Flags)
 * @access  Private (Admin Only)
 */
router.patch('/config', protect, authorize('admin', 'super_admin'), systemController.updateSettings);

module.exports = router;
