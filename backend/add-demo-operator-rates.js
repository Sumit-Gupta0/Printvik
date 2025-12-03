/**
 * Add Demo Custom Operator Rates
 * Sets custom rates for the first operator found in database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const addDemoRates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find first operator
        const operator = await User.findOne({ role: 'operator' });

        if (!operator) {
            console.log('❌ No operator found in database');
            process.exit(1);
        }

        console.log(`\n📋 Found operator: ${operator.name} (${operator.email})`);

        // Set demo custom rates (only paper types with tier structure)
        const demoRates = {
            // A4 rates - Premium rates for this operator
            a4BWSingle: {
                base: 1.2,   // Higher than global ₹1.0
                tier1: 1.1,
                tier2: 1.0,
                tier3: 0.9   // Higher than global ₹0.8
            },
            a4ColorSingle: {
                base: 6.0,   // Higher than global ₹5.0
                tier1: 5.5,
                tier2: 5.0,
                tier3: 4.5   // Partial override
            },
            a3BWSingle: {
                tier3: 1.5   // Only override bulk tier
            }
        };

        operator.operatorRateOverrides = new Map(Object.entries(demoRates));
        await operator.save();

        console.log('\n✅ Demo custom rates added successfully!');
        console.log('\n📊 Custom Rates Set:');
        console.log(JSON.stringify(demoRates, null, 2));

        console.log('\n💡 These rates will override global defaults for this operator.');
        console.log('   Go to Finance → Payouts → Click "Custom Rates" to see them!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addDemoRates();
