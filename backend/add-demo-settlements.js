/**
 * Add Demo Settlement History
 * Creates historical settlement records for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const PaymentSettlement = require('./models/PaymentSettlement');
const Ledger = require('./models/Ledger');

const addDemoSettlements = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find operators and admin
        const operators = await User.find({ role: 'operator' }).limit(4);
        const admin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });

        if (operators.length === 0) {
            console.log('❌ No operators found');
            process.exit(1);
        }

        if (!admin) {
            console.log('❌ No admin found');
            process.exit(1);
        }

        console.log(`\n📋 Found ${operators.length} operators and admin: ${admin.name}`);

        // Create demo settlements for past 60 days
        const settlements = [];
        const now = new Date();

        for (let i = 0; i < 50; i++) {
            const operator = operators[i % operators.length];
            const daysAgo = Math.floor(Math.random() * 60); // Random day in last 60 days
            const settledAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
            const amount = Math.floor(Math.random() * 3000) + 500; // ₹500-3500

            settlements.push({
                entityId: operator._id,
                entityType: 'OPERATOR',
                amount,
                ledgerEntries: [], // Empty for demo
                transactionRef: `TXN-${Date.now()}-${i}`,
                settledBy: admin._id,
                settledAt,
                status: i % 10 === 0 ? 'FAILED' : 'COMPLETED', // 10% failed
                notes: i % 10 === 0 ? 'Payment gateway error' : ''
            });
        }

        // Insert settlements
        await PaymentSettlement.insertMany(settlements);

        console.log(`\n✅ Created ${settlements.length} demo settlement records!`);
        console.log('\n📊 Settlement Summary:');

        // Show summary by operator
        const summary = {};
        settlements.forEach(s => {
            const op = operators.find(o => o._id.equals(s.entityId));
            if (!summary[op.name]) {
                summary[op.name] = { count: 0, total: 0, completed: 0, failed: 0 };
            }
            summary[op.name].count++;
            summary[op.name].total += s.amount;
            if (s.status === 'COMPLETED') summary[op.name].completed++;
            else summary[op.name].failed++;
        });

        Object.entries(summary).forEach(([name, data]) => {
            console.log(`  ${name}:`);
            console.log(`    - ${data.count} settlements`);
            console.log(`    - ₹${data.total.toFixed(2)} total`);
            console.log(`    - ${data.completed} completed, ${data.failed} failed`);
        });

        console.log('\n💡 Settlements created with dates spread over last 60 days');
        console.log('   Use GET /api/admin/finance/settlements to view them\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addDemoSettlements();
