/**
 * Delivery Zone Controller
 * Check delivery availability by pincode
 */

const DeliveryZone = require('../models/DeliveryZone');

/**
 * Check if delivery is available for pincode
 * @route GET /api/delivery-zones/check/:pincode
 */
exports.checkDeliveryAvailability = async (req, res) => {
    try {
        const { pincode } = req.params;

        // Find delivery zone by pincode
        const zone = await DeliveryZone.findOne({
            type: 'pincode',
            pincodes: pincode,
            isActive: true
        });

        if (zone) {
            return res.json({
                success: true,
                data: {
                    deliveryAvailable: zone.deliveryAvailable,
                    deliveryCharge: zone.deliveryCharge || 0,
                    estimatedDeliveryTime: zone.estimatedDeliveryTime || '2-3 days',
                    zoneName: zone.name
                }
            });
        }

        // If no specific zone found, return default (pickup only)
        res.json({
            success: true,
            data: {
                deliveryAvailable: false,
                deliveryCharge: 0,
                message: 'Delivery not available in this area. Pickup only.'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking delivery zone',
            error: error.message
        });
    }
};
