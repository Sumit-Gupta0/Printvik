/**
 * Set Default Admin PIN
 * Sets a default 4-digit PIN (1234) for all admins who don't have one
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const setDefaultPins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all admins without a PIN
        const admins = await User.find({
            role: { $in: ['admin', 'super_admin'] }
        }).select('+securityPin');

        console.log(`\n📋 Found ${admins.length} admin(s)`);

        let updated = 0;
        const defaultPin = '1234'; // Default PIN

        for (const admin of admins) {
            if (!admin.securityPin) {
                // Hash the PIN
                const salt = await bcrypt.genSalt(10);
                admin.securityPin = await bcrypt.hash(defaultPin, salt);
                await admin.save();

                console.log(`✅ Set PIN for: ${admin.name} (${admin.email})`);
                updated++;
            } else {
                console.log(`⏭️  ${admin.name} already has a PIN`);
            }
        }

        if (updated > 0) {
            console.log(`\n✅ Set default PIN for ${updated} admin(s)`);
            console.log(`\n🔐 Default PIN: ${defaultPin}`);
            console.log('   Admins can change this later from Settings page\n');
        } else {
            console.log('\n✅ All admins already have PINs set!\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

setDefaultPins();
