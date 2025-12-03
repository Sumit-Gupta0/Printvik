const mongoose = require('mongoose');
const NotificationService = require('./services/NotificationService');
const User = require('./models/User');
require('dotenv').config();

async function testService() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        // Create a dummy user for testing
        const testUser = {
            _id: new mongoose.Types.ObjectId(),
            name: 'Test User',
            email: 'test@example.com',
            phone: '+919999999999',
            fcmToken: 'dummy_token'
        };

        console.log('\n🧪 Testing Notification Service...');

        // 1. WELCOME_USER
        console.log('\n1. Testing WELCOME_USER...');
        const res1 = await NotificationService.send('WELCOME_USER', testUser, {
            name: testUser.name
        });
        console.log('Result:', res1.success ? '✅ Success' : '❌ Failed', res1.status);

        // 2. ORDER_PLACED
        console.log('\n2. Testing ORDER_PLACED...');
        const res2 = await NotificationService.send('ORDER_PLACED', testUser, {
            name: testUser.name,
            orderNumber: 'ORD-TEST-001',
            amount: 500,
            trackingLink: 'http://test.com/track'
        });
        console.log('Result:', res2.success ? '✅ Success' : '❌ Failed', res2.status);

        // 3. ORDER_STATUS_UPDATED
        console.log('\n3. Testing ORDER_STATUS_UPDATED...');
        const res3 = await NotificationService.send('ORDER_STATUS_UPDATED', testUser, {
            orderNumber: 'ORD-TEST-001',
            status: 'OUT FOR DELIVERY'
        });
        console.log('Result:', res3.success ? '✅ Success' : '❌ Failed', res3.status);

        // 4. RIDER_ASSIGNED
        console.log('\n4. Testing RIDER_ASSIGNED...');
        const res4 = await NotificationService.send('RIDER_ASSIGNED', testUser, {
            orderNumber: 'ORD-TEST-001',
            shopName: 'Test Shop'
        });
        console.log('Result:', res4.success ? '✅ Success' : '❌ Failed', res4.status);

        // 5. KYC_UPDATE
        console.log('\n5. Testing KYC_UPDATE...');
        const res5 = await NotificationService.send('KYC_UPDATE', testUser, {
            name: testUser.name,
            status: 'APPROVED',
            reason: 'All good'
        });
        console.log('Result:', res5.success ? '✅ Success' : '❌ Failed', res5.status);

        console.log('\n🎉 Service Verification Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testService();
