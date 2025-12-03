/**
 * Admin Auth Controller
 * Handles admin authentication, PIN management, and password updates
 */

const User = require('../../models/User');
const bcrypt = require('bcryptjs');

/**
 * Set Admin Security PIN
 * @route POST /api/admin/set-pin
 */
exports.setPin = async (req, res) => {
    try {
        const { pin, oldPin } = req.body;
        if (!pin || pin.length !== 6) {
            return res.status(400).json({ success: false, message: 'New PIN must be 6 digits' });
        }

        const user = await User.findById(req.user.id).select('+securityPin');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If PIN is already set, require old PIN verification
        if (user.securityPin) {
            if (!oldPin) {
                return res.status(400).json({ success: false, message: 'Current PIN is required to set a new one' });
            }
            const isMatch = await bcrypt.compare(oldPin, user.securityPin);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid current PIN' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        user.securityPin = await bcrypt.hash(pin, salt);
        await user.save();

        res.json({ success: true, message: 'Security PIN updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error setting PIN', error: error.message });
    }
};

/**
 * Update Admin Password (requires PIN)
 * @route POST /api/admin/update-password
 */
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, pin } = req.body;

        if (!currentPassword || !newPassword || !pin) {
            return res.status(400).json({ success: false, message: 'Please provide all fields' });
        }

        const user = await User.findById(req.user.id).select('+password +securityPin');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Verify PIN
        if (!user.securityPin) {
            return res.status(400).json({ success: false, message: 'Security PIN not set. Please set it first.' });
        }
        const isPinMatch = await bcrypt.compare(pin, user.securityPin);
        if (!isPinMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Security PIN' });
        }

        // 2. Verify Current Password
        const isPasswordMatch = await user.comparePassword(currentPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        // 3. Update Password
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating password', error: error.message });
    }
};

/**
 * Verify Admin Security PIN
 * @route POST /api/admin/verify-pin
 */
exports.verifyPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const user = await User.findById(req.user.id).select('+securityPin');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.securityPin) {
            return res.status(400).json({ success: false, message: 'PIN not set. Please set a PIN first.' });
        }

        const isMatch = await bcrypt.compare(pin, user.securityPin);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid PIN' });
        }

        res.json({ success: true, message: 'PIN verified' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying PIN', error: error.message });
    }
};
