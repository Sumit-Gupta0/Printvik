const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const resetUsers = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userCountBefore = await User.countDocuments();
        console.log(`Current user count: ${userCountBefore}`);

        if (userCountBefore === 0) {
            console.log('No users found to delete.');
        } else {
            console.log('Deleting all users...');
            const result = await User.deleteMany({});
            console.log(`Successfully deleted ${result.deletedCount} users.`);
        }

        const userCountAfter = await User.countDocuments();
        console.log(`Remaining user count: ${userCountAfter}`);

        if (userCountAfter === 0) {
            console.log('✅ User database reset complete.');
        } else {
            console.error('❌ Failed to delete all users.');
        }

    } catch (error) {
        console.error('Error resetting users:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit();
    }
};

resetUsers();
