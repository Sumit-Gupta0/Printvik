/**
 * System Controller
 * Handles system-level configurations (Maintenance Mode, Feature Flags)
 */

const SystemConfig = require('../models/SystemConfig');

/**
 * Get current system configuration
 * @route GET /api/system/config
 */
exports.getSettings = async (req, res) => {
    try {
        const config = await SystemConfig.getSettings();
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error fetching system config:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Update system configuration
 * @route PATCH /api/system/config
 */
exports.updateSettings = async (req, res) => {
    try {
        const { maintenanceMode, features, appVersions } = req.body;

        const config = await SystemConfig.getSettings();

        if (maintenanceMode) {
            config.maintenanceMode = { ...config.maintenanceMode, ...maintenanceMode };
        }

        if (features) {
            config.features = { ...config.features, ...features };
        }

        if (appVersions) {
            config.appVersions = { ...config.appVersions, ...appVersions };
        }

        config.lastUpdatedBy = req.user._id;
        config.lastUpdatedAt = Date.now();

        await config.save();

        res.json({
            success: true,
            message: 'System configuration updated successfully',
            data: config
        });
    } catch (error) {
        console.error('Error updating system config:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
