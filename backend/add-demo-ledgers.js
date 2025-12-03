/**
 * Add Demo Ledger Entries for Operators
 * Creates pending payout entries so operators appear in Payouts tab
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Ledger = require('./models/Ledger');

const addDemoLedgers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all operators
        const operators = await User.find({ role: 'operator' });

        if (operators.length === 0) {
            console.log('❌ No operators found in database');
            process.exit(1);
        }

        console.log(`\n📋 Found ${operators.length} operators`);

        // Create demo ledger entries for each operator
        const ledgerEntries = [];

        for (const operator of operators) {
            // Create 3-5 random pending payout entries per operator
            const numEntries = Math.floor(Math.random() * 3) + 3; // 3-5 entries

            for (let i = 0; i < numEntries; i++) {
                const amount = Math.floor(Math.random() * 500) + 100; // ₹100-600

                ledgerEntries.push({
                    entityId: operator._id,
                    entityType: 'OPERATOR',
                    type: 'CREDIT',
                    amount: amount,
                    description: `Printing service payout - Order #${Math.floor(Math.random() * 10000)}`,
                    status: 'PENDING',
                    orderId: new mongoose.Types.ObjectId() // Mock order ID
                });
            }
        }

        // Insert all ledger entries
        await Ledger.insertMany(ledgerEntries);

        console.log(`\n✅ Created ${ledgerEntries.length} demo ledger entries!`);
        console.log('\n📊 Operators with pending payouts:');

        // Show summary
        for (const operator of operators) {
            const operatorEntries = ledgerEntries.filter(e => e.entityId.equals(operator._id));
            const total = operatorEntries.reduce((sum, e) => sum + e.amount, 0);
            console.log(`  - ${operator.name}: ${operatorEntries.length} orders, ₹${total.toFixed(2)} total`);
        }

        console.log('\n💡 Now go to Finance → Payouts tab to see operators!');
        console.log('   Click "Custom Rates" to configure operator-specific rates.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addDemoLedgers();
