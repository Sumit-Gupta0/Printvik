/**
 * User Routes
 * Handles user profile, addresses, and preferences
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, userController.updateProfile);

/**
 * @route   GET /api/users/addresses
 * @desc    Get user addresses
 * @access  Private
 */
router.get('/addresses', protect, userController.getAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses', protect, userController.addAddress);

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:id', protect, userController.updateAddress);

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:id', protect, userController.deleteAddress);

/**
 * @route   POST /api/users/kyc
 * @desc    Upload KYC documents
 * @access  Private
 */
router.post('/kyc', protect, userController.uploadKyc);

module.exports = router;
