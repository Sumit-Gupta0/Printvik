/**
 * Admin Content Controller
 * Handles Service Types, Delivery Zones, Coupons, Pricing, Config, and Notifications
 */

const ServiceType = require('../../models/ServiceType');
const DeliveryZone = require('../../models/DeliveryZone');
const Coupon = require('../../models/Coupon');
const OperatorPayout = require('../../models/OperatorPayout');
const SystemConfig = require('../../models/SystemConfig');
const PricingConfig = require('../../models/PricingConfig');
const GlobalSettings = require('../../models/GlobalSettings');
const Ledger = require('../../models/Ledger');
const PaymentSettlement = require('../../models/PaymentSettlement');
const NotificationTemplate = require('../../models/NotificationTemplate');
const NotificationLog = require('../../models/NotificationLog');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { messaging } = require('../../config/firebase');

// ==========================================
// Service Management
// ==========================================

exports.getServices = async (req, res) => {
    try {
        const services = await ServiceType.find().sort({ category: 1, name: 1 });
        res.json({ success: true, count: services.length, data: services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
};

exports.createService = async (req, res) => {
    try {
        const service = await ServiceType.create({ ...req.body, createdBy: req.user.id });
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ success: false, message: 'Error creating service' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const service = await ServiceType.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, data: service });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ success: false, message: 'Error updating service' });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await ServiceType.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ success: false, message: 'Error deleting service' });
    }
};

// ==========================================
// Delivery Zones & Coupons
// ==========================================

exports.createDeliveryZone = async (req, res) => {
    try {
        const zone = await DeliveryZone.create({ ...req.body, createdBy: req.user.id });
        res.status(201).json({ success: true, message: 'Delivery zone created successfully', data: { zone } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating delivery zone', error: error.message });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create({ ...req.body, createdBy: req.user.id });
        res.status(201).json({ success: true, message: 'Coupon created successfully', data: { coupon } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating coupon', error: error.message });
    }
};

// ==========================================
// Operator Payouts
// ==========================================

exports.getOperatorPayouts = async (req, res) => {
    try {
        const { status, operatorId } = req.query;
        const query = {};
        if (status) query.status = status;
        if (operatorId) query.operatorId = operatorId;

        const payouts = await OperatorPayout.find(query)
            .populate('operatorId', 'name email phone')
            .populate('orderId', 'orderNumber')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: { payouts } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching payouts', error: error.message });
    }
};

exports.updateOperatorPayout = async (req, res) => {
    try {
        const { status, paymentMethod, paymentReference } = req.body;
        const payout = await OperatorPayout.findByIdAndUpdate(
            req.params.id,
            {
                status,
                paymentMethod,
                paymentReference,
                paidAt: status === 'paid' ? new Date() : null
            },
            { new: true }
        );
        res.json({ success: true, message: 'Payout updated successfully', data: { payout } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating payout', error: error.message });
    }
};

// ==========================================
// System Configuration
// ==========================================

exports.getConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'global_settings' });
        if (!config) config = await SystemConfig.create({ key: 'global_settings' });
        res.json({ success: true, config });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const {
            platformCommissionPercent,
            baseDeliveryFee,
            surgeChargeMultiplier,
            isAppMaintenanceMode,
            maxFileSizeMB,
            allowedFileTypes
        } = req.body;

        let config = await SystemConfig.findOne({ key: 'global_settings' });
        if (!config) config = new SystemConfig({ key: 'global_settings' });

        config.platformCommissionPercent = platformCommissionPercent ?? config.platformCommissionPercent;
        config.baseDeliveryFee = baseDeliveryFee ?? config.baseDeliveryFee;
        config.surgeChargeMultiplier = surgeChargeMultiplier ?? config.surgeChargeMultiplier;
        config.isAppMaintenanceMode = isAppMaintenanceMode ?? config.isAppMaintenanceMode;
        config.maxFileSizeMB = maxFileSizeMB ?? config.maxFileSizeMB;
        config.allowedFileTypes = allowedFileTypes ?? config.allowedFileTypes;
        config.updatedBy = req.user._id;

        await config.save();
        res.json({ success: true, message: 'System configuration updated', config });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// Pricing Configuration
// ==========================================

exports.getPricingConfig = async (req, res) => {
    try {
        let config = await PricingConfig.findOne();
        if (!config) {
            config = await PricingConfig.create({
                baseRate: 2,
                colorRate: 10,
                bindingFee: 30,
                deliveryFee: 40,
                platformFee: 5,
                gstRate: 18,
                minOrderAmount: 50,
                freeDeliveryThreshold: 500
            });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Get pricing config error:', error);
        res.status(500).json({ success: false, message: 'Error fetching pricing configuration' });
    }
};

exports.updatePricingConfig = async (req, res) => {
    try {
        let config = await PricingConfig.findOne();
        if (!config) {
            config = await PricingConfig.create({ ...req.body, updatedBy: req.user.id });
        } else {
            config = await PricingConfig.findOneAndUpdate(
                {},
                { ...req.body, updatedBy: req.user.id, updatedAt: Date.now() },
                { new: true, runValidators: true }
            );
        }
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Update pricing config error:', error);
        res.status(500).json({ success: false, message: 'Error updating pricing configuration' });
    }
};

exports.updateGlobalPricing = async (req, res) => {
    try {
        const { platformCommissionPercent, baseDeliveryFee, surgeChargeMultiplier } = req.body;
        let config = await SystemConfig.findOne({ key: 'global_settings' });
        if (!config) config = new SystemConfig({ key: 'global_settings' });

        if (platformCommissionPercent !== undefined) config.platformCommissionPercent = platformCommissionPercent;
        if (baseDeliveryFee !== undefined) config.baseDeliveryFee = baseDeliveryFee;
        if (surgeChargeMultiplier !== undefined) config.surgeChargeMultiplier = surgeChargeMultiplier;

        config.updatedBy = req.user.id;
        await config.save();
        res.json({ success: true, message: 'Pricing config updated', data: config });
    } catch (error) {
        console.error('Pricing config error:', error);
        res.status(500).json({ success: false, message: 'Error updating pricing config' });
    }
};

exports.getGlobalSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) settings = await GlobalSettings.create({});
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching settings' });
    }
};

exports.updateGlobalSettings = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating settings' });
    }
};

// ==========================================
// Finance Settlement
// ==========================================

exports.settleFinance = async (req, res) => {
    try {
        const { entityId, amount, transactionRef, pin } = req.body;

        // Verify admin PIN
        const admin = await User.findById(req.user.id).select('+securityPin');
        if (!admin.securityPin) {
            return res.status(400).json({ success: false, message: 'Security PIN not set. Please set a PIN first.' });
        }

        const isPinMatch = await bcrypt.compare(pin, admin.securityPin);
        if (!isPinMatch) {
            return res.status(401).json({ success: false, message: 'Invalid security PIN' });
        }

        // Find all pending ledger entries for this entity
        const pendingLedgers = await Ledger.find({
            entityId: entityId,
            status: 'PENDING'
        });

        if (pendingLedgers.length === 0) {
            return res.status(404).json({ success: false, message: 'No pending payouts found' });
        }

        // Determine entity type from first ledger entry
        const entityType = pendingLedgers[0].entityType;

        // Mark pending ledgers as settled
        await Ledger.updateMany(
            { entityId: entityId, status: 'PENDING' },
            { $set: { status: 'SETTLED', transactionRef: transactionRef } }
        );

        // Create settlement history record
        const settlement = await PaymentSettlement.create({
            entityId,
            entityType,
            amount,
            ledgerEntries: pendingLedgers.map(l => l._id),
            transactionRef,
            settledBy: req.user._id,
            status: 'COMPLETED'
        });

        res.json({
            success: true,
            message: 'Settlement processed successfully',
            data: {
                settlementId: settlement._id,
                amount: settlement.amount,
                settledAt: settlement.settledAt
            }
        });
    } catch (error) {
        console.error('Settlement error:', error);
        res.status(500).json({ success: false, message: 'Error processing settlement' });
    }
};

// ==========================================
// Notifications
// ==========================================

exports.getNotificationTemplates = async (req, res) => {
    try {
        const templates = await NotificationTemplate.find().sort({ eventKey: 1 });
        res.json({ success: true, data: templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Error fetching templates' });
    }
};

exports.getNotificationTemplateById = async (req, res) => {
    try {
        const template = await NotificationTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
        res.json({ success: true, data: template });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ success: false, message: 'Error fetching template' });
    }
};

exports.updateNotificationTemplate = async (req, res) => {
    try {
        const { channels } = req.body;
        const template = await NotificationTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

        if (channels) {
            template.channels = { ...template.channels, ...channels };
        }

        await template.save();
        res.json({ success: true, data: template, message: 'Template updated successfully' });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ success: false, message: 'Error updating template' });
    }
};

/**
 * @openapi
 * /api/admin/notifications/marketing:
 *   post:
 *     summary: Send marketing campaign
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               targetAudience:
 *                 type: string
 *                 enum: [all_users, inactive_30]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign sent successfully
 */
exports.sendMarketingCampaign = async (req, res) => {
    try {
        const { targetAudience, title, message, image } = req.body;

        let query = { role: 'user' };
        if (targetAudience === 'inactive_30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.lastLogin = { $lt: thirtyDaysAgo };
        } else if (targetAudience === 'all_users') {
            // No additional filter
        }

        const users = await User.find(query).select('name email phone fcmToken');

        // Send in batches
        let sentCount = 0;
        const batchSize = 50;

        // We use a loop to process batches to avoid overwhelming the server
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);
            await Promise.all(batch.map(async (user) => {
                try {
                    await NotificationService.send('MARKETING_CAMPAIGN', user, {
                        title,
                        message,
                        image: image || ''
                    });
                    sentCount++;
                } catch (err) {
                    console.error(`Failed to send to user ${user._id}:`, err.message);
                }
            }));
        }

        res.json({
            success: true,
            message: `Campaign sent to ${sentCount} users`,
            data: { sentCount, totalTargeted: users.length }
        });
    } catch (error) {
        console.error('Error sending campaign:', error);
        res.status(500).json({ success: false, message: 'Error sending campaign' });
    }
};

exports.broadcastToRiders = async (req, res) => {
    try {
        const { title, body } = req.body;
        // Mock broadcast for now
        console.log(`[BROADCAST] To Riders: ${title} - ${body}`);
        res.json({ success: true, message: 'Broadcast sent to all riders' });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ success: false, message: 'Error sending broadcast' });
    }
};
