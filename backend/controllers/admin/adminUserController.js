/**
 * Admin User Controller
 * Handles User Management, KYC, Wallet, and Operator Rates
 */

const User = require('../../models/User');
const Order = require('../../models/Order');
const bcrypt = require('bcryptjs');
const { decrypt } = require('../../utils/encryption');
const NotificationService = require('../../services/NotificationService');

exports.getUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            data: { users, totalPages: Math.ceil(count / limit), currentPage: page, total: count }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('addresses')
            .populate('serviceCapabilities');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user details', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        Object.keys(req.body).forEach(key => { user[key] = req.body[key]; });
        await user.save();

        res.json({ success: true, message: 'User updated successfully', data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
};

exports.verifyKyc = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (status === 'approved') {
            user.kyc.isVerified = true;
            user.kyc.rejectionReason = null;
            user.isApproved = true;
            user.status.isOnline = true;
        } else if (status === 'rejected') {
            user.kyc.isVerified = false;
            user.kyc.rejectionReason = rejectionReason || 'Documents rejected';
            user.isApproved = false;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        await user.save();

        // Send Notification
        await NotificationService.send('KYC_UPDATE', user, {
            name: user.name,
            status: status.toUpperCase(),
            reason: rejectionReason || 'Documents verified'
        });

        res.json({ success: true, message: `KYC ${status} successfully`, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying KYC', error: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { sendSms = true } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const generatePassword = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
            let password = '';
            for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
            return password;
        };

        const newPassword = generatePassword();
        user.password = newPassword;
        await user.save();

        let smsStatus = 'pending';
        if (sendSms && user.phone) {
            // Mock SMS
            console.log(`SMS to ${user.phone}: Your new password is ${newPassword}`);
            smsStatus = 'sent';
        }

        console.log(`[AUDIT] Admin ${req.user.name} reset password for ${user.name}`);
        res.json({ success: true, message: 'Password reset successfully', newPassword, smsStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
    }
};

exports.resetUserPasswordWithPin = async (req, res) => {
    try {
        const { pin, password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password too short' });

        const admin = await User.findById(req.user.id).select('+securityPin');
        if (!admin.securityPin) return res.status(400).json({ success: false, message: 'Security PIN not set' });

        const isMatch = await bcrypt.compare(pin, admin.securityPin);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid Security PIN' });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.password = password;
        await user.save();
        res.json({ success: true, message: 'User password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
    }
};

exports.revealUserPassword = async (req, res) => {
    try {
        const { pin } = req.body;
        const admin = await User.findById(req.user.id).select('+securityPin');
        if (!admin.securityPin) return res.status(400).json({ success: false, message: 'Security PIN not set' });

        const isMatch = await bcrypt.compare(pin, admin.securityPin);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid Security PIN' });

        const user = await User.findById(req.params.id).select('+encryptedPassword');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.encryptedPassword) return res.status(404).json({ success: false, message: 'Password not available' });

        const decryptedPassword = decrypt(user.encryptedPassword);
        res.json({ success: true, data: { password: decryptedPassword } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error revealing password', error: error.message });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let query = {};
        if (user.role === 'user') query = { userId: user._id };
        else if (user.role === 'operator') query = { assignedOperator: user._id };
        else if (user.role === 'delivery') query = { assignedDeliveryPerson: user._id };
        else query = { userId: user._id };

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('assignedOperator', 'name')
            .populate('assignedDeliveryPerson', 'name');

        res.json({ success: true, data: { orders, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user history', error: error.message });
    }
};

exports.updateUserWallet = async (req, res) => {
    try {
        const { amount, type, reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

        if (type === 'credit') user.walletBalance = (user.walletBalance || 0) + amountNum;
        else if (type === 'debit') {
            if ((user.walletBalance || 0) < amountNum) return res.status(400).json({ success: false, message: 'Insufficient balance' });
            user.walletBalance = (user.walletBalance || 0) - amountNum;
        } else return res.status(400).json({ success: false, message: 'Invalid transaction type' });

        user.adminNotes.push({ text: `Wallet ${type}: ₹${amountNum}. Reason: ${reason}`, author: req.user.name, date: new Date() });
        await user.save();

        res.json({ success: true, data: { walletBalance: user.walletBalance, adminNotes: user.adminNotes } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addUserNote = async (req, res) => {
    try {
        const { text } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.adminNotes.push({ text, author: req.user.name, date: new Date() });
        await user.save();

        res.json({ success: true, data: { adminNotes: user.adminNotes } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateOperatorRates = async (req, res) => {
    try {
        const { userId } = req.params;
        const { operatorRateOverrides } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role !== 'operator') return res.status(400).json({ success: false, message: 'User is not an operator' });

        user.operatorRateOverrides = new Map(Object.entries(operatorRateOverrides || {}));
        await user.save();

        res.json({
            success: true,
            message: 'Operator rates updated successfully',
            data: { userId: user._id, name: user.name, operatorRateOverrides: Object.fromEntries(user.operatorRateOverrides) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating operator rates' });
    }
};

exports.getOperatorRates = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({
            success: true,
            data: {
                userId: user._id,
                name: user.name,
                hasCustomRates: user.operatorRateOverrides && user.operatorRateOverrides.size > 0,
                operatorRateOverrides: user.operatorRateOverrides ? Object.fromEntries(user.operatorRateOverrides) : {}
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching operator rates' });
    }
};
