const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function promoteUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        const email = 'admin@printvik.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            process.exit(1);
        }

        user.role = 'super_admin';
        await user.save();

        console.log(`🎉 Successfully promoted ${user.name} (${user.email}) to SUPER_ADMIN`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

promoteUser();
