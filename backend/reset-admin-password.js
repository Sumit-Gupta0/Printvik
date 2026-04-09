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
        const adminEmail = 'admin@printvik.com';
        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            console.log(`Admin user not found. Creating ${adminEmail}...`);
            admin = new User({
                name: 'Admin User',
                email: adminEmail,
                phone: '9999999999',
                password: 'admin123',
                role: 'admin',
                isApproved: true,
                isActive: true
            });
        } else {
            console.log(`Resetting password for admin: ${admin.email}`);
            admin.password = 'admin123';
        }

        await admin.save();

        console.log('---------------------------------------------------');
        console.log('✅ Admin credentials configured successfully!');
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
