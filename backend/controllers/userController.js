/**
 * User Controller
 * Handles user profile, addresses, and preferences
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Address = require('../models/Address');
const NotificationService = require('../services/NotificationService');

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('addresses')
            .populate('serviceCapabilities');

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, operatorLocation, serviceArea, maxCapacity, vehicleType, securityPin } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (operatorLocation) updateFields.operatorLocation = operatorLocation;
        if (serviceArea) updateFields.serviceArea = serviceArea;
        if (maxCapacity) updateFields.maxCapacity = maxCapacity;
        if (vehicleType) updateFields.vehicleType = vehicleType;

        // Handle Security PIN update
        if (securityPin) {
            const salt = await bcrypt.genSalt(10);
            updateFields.securityPin = await bcrypt.hash(securityPin, salt);
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/users/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *   post:
 *     summary: Add new address
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressLine1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added successfully
 */
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });

        res.json({
            success: true,
            data: { addresses }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses',
            error: error.message
        });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

        const address = await Address.create({
            userId: req.user.id,
            name,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            isDefault
        });

        // Update user's addresses array
        await User.findByIdAndUpdate(req.user.id, {
            $push: { addresses: address._id }
        });

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: { address }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding address',
            error: error.message
        });
    }
};

/**
 * Update address
 * @route PUT /api/users/addresses/:id
 */
exports.updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: { address: updatedAddress }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error: error.message
        });
    }
};

/**
 * Delete address
 * @route DELETE /api/users/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Remove from user's addresses array
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { addresses: address._id }
        });

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/users/kyc:
 *   post:
 *     summary: Upload KYC documents
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aadhaarUrl:
 *                 type: string
 *               panUrl:
 *                 type: string
 *               gstUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC uploaded successfully
 */
exports.uploadKyc = async (req, res) => {
    try {
        const { aadhaarUrl, panUrl, gstUrl } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.kyc = {
            aadhaarUrl,
            panUrl,
            gstUrl,
            isVerified: false,
            rejectionReason: null
        };

        await user.save();

        // Trigger Admin Alert
        await NotificationService.sendAdminAlert(
            'INFO',
            'New KYC Submission',
            `${user.name} has submitted KYC documents for verification.`,
            `/admin/users/${user._id}`,
            { type: 'USER', id: user._id }
        );

        res.json({
            success: true,
            message: 'KYC documents uploaded successfully',
            data: { kyc: user.kyc }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading KYC',
            error: error.message
        });
    }
};
