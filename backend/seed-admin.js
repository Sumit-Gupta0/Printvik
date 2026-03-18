const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@printvik.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        console.log('Creating default admin user...');
        const adminUser = new User({
            name: 'Admin User',
            email: adminEmail,
            phone: '9999999999',
            password: 'password123',
            role: 'admin',
            isApproved: true,
            isActive: true
        });

        await adminUser.save();
        console.log('✅ Default admin user created successfully.');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: password123');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit();
    }
};

createAdmin();
