const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        const email = 'test-e2e-admin@example.com';
        const password = 'password123';

        let user = await User.findOne({ email });

        if (!user) {
            console.log(`⚠️ User not found. Creating new admin user...`);
            user = new User({
                name: 'E2E Admin',
                email: email,
                phone: '+919999999903',
                role: 'admin'
            });
        }

        // Explicitly set password to trigger pre-save hook
        user.password = password;
        await user.save();

        console.log(`🎉 Password for ${email} has been reset to: ${password}`);
        console.log(`🔑 Role: ${user.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetPassword();
