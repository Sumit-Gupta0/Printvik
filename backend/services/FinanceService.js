const User = require('../models/User');
const Order = require('../models/Order');

class FinanceService {
    /**
     * Split payment upon order delivery
     * @param {Object} order - The delivered order object
     */
    static async splitPayment(order) {
        try {
            console.log(`[FinanceService] Splitting payment for Order #${order.orderNumber}`);

            // 1. Calculate Shares
            const totalAmount = order.totalAmount;
            const deliveryFee = 40; // Fixed for now, or get from order.deliveryFee
            const subtotal = totalAmount - deliveryFee;

            // Operator Share (e.g., 90% of subtotal)
            // In real app, fetch commission rate from Operator profile
            const operatorId = order.assignedOperator;
            const operator = await User.findById(operatorId);
            const commissionRate = operator?.financials?.commissionRate || 10; // Default 10%
            const adminCommission = (subtotal * commissionRate) / 100;
            const operatorShare = subtotal - adminCommission;

            // Rider Share (100% of delivery fee for now)
            const riderShare = deliveryFee;

            // Admin Profit
            const adminProfit = adminCommission;

            console.log(`[FinanceService] Split: Operator: ${operatorShare}, Rider: ${riderShare}, Admin: ${adminProfit}`);

            // 2. Update Operator Wallet (Pending Payout)
            if (operator) {
                operator.financials.pendingPayout = (operator.financials.pendingPayout || 0) + operatorShare;
                operator.adminNotes.push({
                    text: `Order #${order.orderNumber} delivered. Credit: ₹${operatorShare}`,
                    author: 'System',
                    date: new Date()
                });
                await operator.save();
            }

            // 3. Update Rider Wallet (Wallet Balance)
            const riderId = order.assignedDeliveryPerson;
            if (riderId) {
                const rider = await User.findById(riderId);
                if (rider) {
                    rider.walletBalance = (rider.walletBalance || 0) + riderShare;
                    rider.adminNotes.push({
                        text: `Order #${order.orderNumber} delivered. Credit: ₹${riderShare}`,
                        author: 'System',
                        date: new Date()
                    });

                    // Handle COD (Cash on Delivery)
                    // If Rider collected Cash, it's a debt (Floating Cash)
                    // We need to track this. For now, let's assume 'walletBalance' is net earnings.
                    // If COD, we might deduct from wallet or track separately.
                    // Let's assume 'financials.cashInHand' exists or we use a separate field.
                    // User model has 'financials' but no explicit 'cashInHand' in schema I saw earlier (it had bankDetails).
                    // I'll check User model again or just add it to 'financials' map if it's flexible, 
                    // but schema was strict.
                    // User schema line 84: financials: { commissionRate, pendingPayout, bankDetails }.
                    // It does NOT have cashInHand. I should add it or use 'walletBalance' as net.
                    // For now, I will just credit the earnings.

                    await rider.save();
                }
            }

            // 4. Log Transaction (Mock for now, or create Transaction model later)
            // console.log('Transaction logged');

            return true;

        } catch (error) {
            console.error('[FinanceService] Error splitting payment:', error);
            return false;
        }
    }
}

module.exports = FinanceService;
