// Quick script to check and create demo delivery boys
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAndCreateDeliveryBoys() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        // Check existing delivery boys (role: 'delivery')
        const existingRiders = await User.find({ role: 'delivery' });
        console.log(`📦 Found ${existingRiders.length} delivery boys in database`);

        if (existingRiders.length > 0) {
            console.log('\nExisting Delivery Boys:');
            existingRiders.forEach(rider => {
                console.log(`- ${rider.name} (${rider.email}) - Approved: ${rider.isApproved}, Active: ${rider.isActive}`);
            });
        }

        // Create demo delivery boys if none exist
        if (existingRiders.length === 0) {
            console.log('\n🚀 Creating demo delivery boys...');

            const demoRiders = [
                {
                    name: 'Ravi Kumar',
                    email: 'ravi@delivery.com',
                    phone: '+91-9876543210',
                    password: 'password123',
                    role: 'delivery',
                    isApproved: true,
                    isActive: true
                },
                {
                    name: 'Suresh Sharma',
                    email: 'suresh@delivery.com',
                    phone: '+91-9876543211',
                    password: 'password123',
                    role: 'delivery',
                    isApproved: true,
                    isActive: true
                },
                {
                    name: 'Amit Singh',
                    email: 'amit@delivery.com',
                    phone: '+91-9876543212',
                    password: 'password123',
                    role: 'delivery',
                    isApproved: true,
                    isActive: false
                }
            ];

            for (const riderData of demoRiders) {
                const rider = new User(riderData);
                await rider.save();
                console.log(`✅ Created: ${riderData.name}`);
            }

            console.log('\n🎉 Demo delivery boys created successfully!');
        } else {
            // Update existing riders to be approved and active
            console.log('\n🔧 Updating existing delivery boys...');
            await User.updateMany(
                { role: 'delivery' },
                { $set: { isApproved: true, isActive: true } }
            );
            console.log('✅ All delivery boys are now approved and active');
        }

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndCreateDeliveryBoys();
