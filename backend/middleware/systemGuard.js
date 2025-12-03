/**
 * @file systemGuard.js
 * @module Middleware
 * @description Global middleware to enforce system-level controls like Maintenance Mode and Feature Flags.
 * @requires ../models/SystemConfig
 */

const SystemConfig = require('../models/SystemConfig');

const systemGuard = async (req, res, next) => {
    try {
        // Skip for admin routes to prevent lockout
        if (req.path.startsWith('/api/admin') || req.path.startsWith('/admin')) {
            return next();
        }

        const config = await SystemConfig.getSettings();

        // 1. Check Maintenance Mode
        if (config.maintenanceMode.isActive) {
            return res.status(503).json({
                success: false,
                error: "MAINTENANCE_MODE",
                message: config.maintenanceMode.message
            });
        }

        // 2. Check Feature Flags
        // Example: Block Online Payments if disabled
        if (req.path.includes('/payment') && !config.features.enableOnlinePayment) {
            return res.status(400).json({
                success: false,
                error: "FEATURE_DISABLED",
                message: "Online payments are temporarily disabled. Please use Cash on Delivery."
            });
        }

        // Example: Block COD if disabled
        if (req.path.includes('/order') && req.body.paymentMethod === 'COD' && !config.features.enableCod) {
            return res.status(400).json({
                success: false,
                error: "FEATURE_DISABLED",
                message: "Cash on Delivery is temporarily disabled. Please use Online Payment."
            });
        }

        // Example: Block New Signups if disabled
        if ((req.path.includes('/register') || req.path.includes('/signup')) && !config.features.enableNewSignups) {
            return res.status(403).json({
                success: false,
                error: "REGISTRATION_CLOSED",
                message: "New registrations are temporarily paused due to high traffic."
            });
        }

        next();
    } catch (error) {
        console.error("System Guard Error:", error);
        // Fail open or closed? Let's fail open but log it, to avoid blocking users due to DB error
        next();
    }
};

module.exports = systemGuard;
