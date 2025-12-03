const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        const users = await User.find({}, 'name email role');
        console.log('\n👥 Users:');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listUsers();
