/**
 * Admin Routes
 * Handles admin-specific functionality
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import Admin Controllers
const adminStatsController = require('../controllers/admin/adminStatsController');
const adminUserController = require('../controllers/admin/adminUserController');
const adminOrderController = require('../controllers/admin/adminOrderController');
const adminContentController = require('../controllers/admin/adminContentController');
const adminAuthController = require('../controllers/admin/adminAuthController');

// ==========================================
// Analytics & Dashboard
// ==========================================
router.get('/analytics', protect, authorize('admin', 'super_admin', 'operations'), adminStatsController.getAnalytics);
router.get('/stats/dashboard', protect, authorize('admin', 'super_admin', 'operations'), adminStatsController.getDashboardStats);
router.get('/riders/fleet-status', protect, authorize('admin', 'super_admin', 'operations'), adminStatsController.getFleetStatus);
router.get('/logs', protect, authorize('admin', 'super_admin'), adminStatsController.getAuditLogs);
router.get('/finance/payouts', protect, authorize('admin', 'super_admin'), adminStatsController.getPayouts);
router.get('/finance/settlements', protect, authorize('admin', 'super_admin'), adminStatsController.getSettlements);
router.get('/notifications/stats', protect, authorize('admin', 'super_admin'), adminStatsController.getNotificationStats);
router.get('/notifications/logs', protect, authorize('admin', 'super_admin'), adminStatsController.getNotificationLogs);

// ==========================================
// User Management
// ==========================================
router.get('/users', protect, authorize('admin', 'super_admin', 'support', 'operations'), adminUserController.getUsers);
router.get('/users/:id', protect, authorize('admin', 'super_admin', 'support', 'operations'), adminUserController.getUserById);
router.put('/users/:id', protect, authorize('admin', 'super_admin', 'operations'), adminUserController.updateUser);
router.delete('/users/:id', protect, authorize('admin', 'super_admin'), adminUserController.deleteUser);
router.post('/users/:id/kyc-verify', protect, authorize('admin', 'super_admin'), adminUserController.verifyKyc);
router.post('/users/:id/reset-password', protect, authorize('admin', 'super_admin'), adminUserController.resetUserPassword); // Auto-generate
router.get('/users/:id/history', protect, authorize('admin', 'super_admin', 'support', 'operations'), adminUserController.getUserHistory);
router.post('/users/:id/wallet', protect, authorize('admin', 'super_admin'), adminUserController.updateUserWallet);
router.post('/users/:id/notes', protect, authorize('admin', 'super_admin', 'support', 'operations'), adminUserController.addUserNote);

// Advanced User Security (PIN Required)
router.post('/users/:id/reveal-password', protect, authorize('admin', 'super_admin'), adminUserController.revealUserPassword);
router.post('/users/:id/reset-password-pin', protect, authorize('admin', 'super_admin'), adminUserController.resetUserPasswordWithPin); // Manual set with PIN
// Note: The original route was POST /users/:id/reset-password for both. 
// The controller `resetUserPasswordWithPin` expects `pin` and `password` in body.
// The original code had two handlers for the same route path but different logic? 
// No, lines 620 and 1247 both used `POST /users/:id/reset-password`. This is a conflict in the original file.
// Express would only execute the first one matched. 
// Line 620 was "Auto-generate and send SMS". Line 1247 was "Manual set with PIN".
// Since line 620 appeared first, it likely took precedence. 
// To support both, we should use different paths or merge logic. 
// I will separate them: `/users/:id/reset-password` (Auto) and `/users/:id/reset-password-manual` (Manual with PIN).
router.post('/users/:id/reset-password-manual', protect, authorize('admin', 'super_admin'), adminUserController.resetUserPasswordWithPin);

// Operator Specific
router.put('/users/:userId/operator-rates', protect, authorize('admin', 'super_admin'), adminUserController.updateOperatorRates);
router.get('/users/:userId/operator-rates', protect, authorize('admin', 'super_admin'), adminUserController.getOperatorRates);

// ==========================================
// Order Management
// ==========================================
router.get('/orders', protect, authorize('admin', 'super_admin', 'support', 'operations'), adminOrderController.getOrders);
router.put('/orders/:id', protect, authorize('admin', 'super_admin', 'operations'), adminOrderController.updateOrder);
router.delete('/orders/:id', protect, authorize('admin', 'super_admin'), adminOrderController.deleteOrder);
router.post('/assign-delivery', protect, authorize('admin', 'super_admin', 'operations'), adminOrderController.assignDelivery);
router.post('/orders/:id/reassign', protect, authorize('admin', 'super_admin', 'operations'), adminOrderController.reassignOrder);
router.post('/orders/:id/refund', protect, authorize('admin', 'super_admin'), adminOrderController.refundOrder);
router.post('/orders/:id/verify-file', protect, authorize('admin', 'super_admin'), adminOrderController.verifyOrderFile);

// ==========================================
// Content & Configuration
// ==========================================
router.get('/services', protect, authorize('admin'), adminContentController.getServices);
router.post('/services', protect, authorize('admin'), adminContentController.createService);
router.put('/services/:id', protect, authorize('admin'), adminContentController.updateService);
router.delete('/services/:id', protect, authorize('admin'), adminContentController.deleteService);

router.post('/delivery-zones', protect, authorize('admin', 'super_admin', 'operations'), adminContentController.createDeliveryZone);
router.post('/coupons', protect, authorize('admin', 'super_admin'), adminContentController.createCoupon);

router.get('/operator-payouts', protect, authorize('admin', 'super_admin'), adminContentController.getOperatorPayouts);
router.put('/operator-payouts/:id', protect, authorize('admin', 'super_admin'), adminContentController.updateOperatorPayout);

router.get('/config', protect, authorize('admin', 'super_admin'), adminContentController.getConfig);
router.put('/config', protect, authorize('super_admin'), adminContentController.updateConfig);

router.get('/pricing', protect, authorize('admin'), adminContentController.getPricingConfig);
router.put('/pricing', protect, authorize('admin'), adminContentController.updatePricingConfig);
router.put('/config/pricing', protect, authorize('super_admin'), adminContentController.updateGlobalPricing);

router.get('/config/global', protect, authorize('admin', 'super_admin'), adminContentController.getGlobalSettings);
router.put('/config/global', protect, authorize('admin', 'super_admin'), adminContentController.updateGlobalSettings);

router.post('/finance/settle', protect, authorize('admin', 'super_admin'), adminContentController.settleFinance);

router.get('/notifications/templates', protect, authorize('admin', 'super_admin'), adminContentController.getNotificationTemplates);
router.get('/notifications/templates/:id', protect, authorize('admin', 'super_admin'), adminContentController.getNotificationTemplateById);
router.put('/notifications/templates/:id', protect, authorize('admin', 'super_admin'), adminContentController.updateNotificationTemplate);
router.post('/notifications/marketing', protect, authorize('admin', 'super_admin'), adminContentController.sendMarketingCampaign);
router.post('/riders/broadcast', protect, authorize('admin', 'super_admin'), adminContentController.broadcastToRiders);

// ==========================================
// Admin Auth & Security
// ==========================================
router.post('/set-pin', protect, authorize('admin', 'super_admin'), adminAuthController.setPin);
router.post('/update-password', protect, authorize('admin', 'super_admin'), adminAuthController.updatePassword);
router.post('/verify-pin', protect, authorize('admin', 'super_admin'), adminAuthController.verifyPin);

module.exports = router;
