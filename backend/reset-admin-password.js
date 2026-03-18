require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

const resetAdminPassword = async () => {
    await connectDB();

    try {
        const admins = await User.find({ role: 'admin' });

        if (admins.length === 0) {
            console.log('No admin users found.');
            process.exit(0);
        }

        console.log(`Found ${admins.length} admin(s).`);

        const admin = admins[0];
        console.log(`Resetting password for admin: ${admin.email}`);

        // Set the new password
        // The pre-save hook in User.js will handle hashing and encryption
        admin.password = 'admin123';

        await admin.save();

        console.log('---------------------------------------------------');
        console.log('✅ Admin password reset successfully!');
        console.log('---------------------------------------------------');
        console.log(`Email:    ${admin.email}`);
        console.log(`Password: admin123`);
        console.log('---------------------------------------------------');

    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

resetAdminPassword();
