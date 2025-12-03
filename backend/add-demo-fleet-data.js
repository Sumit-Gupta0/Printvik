// Demo data script for Fleet Monitor Dashboard
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

async function addDemoData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        // ==========================================
        // 1. CREATE DEMO DELIVERY BOYS
        // ==========================================
        console.log('\n📦 Creating demo delivery boys...');

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
                isActive: true
            },
            {
                name: 'Priya Verma',
                email: 'priya@delivery.com',
                phone: '+91-9876543213',
                password: 'password123',
                role: 'delivery',
                isApproved: true,
                isActive: false // Offline
            }
        ];

        const createdRiders = [];
        for (const riderData of demoRiders) {
            const existing = await User.findOne({ email: riderData.email });
            if (!existing) {
                const rider = new User(riderData);
                await rider.save();
                createdRiders.push(rider);
                console.log(`✅ Created: ${riderData.name}`);
            } else {
                createdRiders.push(existing);
                console.log(`ℹ️  Already exists: ${riderData.name}`);
            }
        }

        // ==========================================
        // 2. CREATE DEMO OPERATORS (SHOPS)
        // ==========================================
        console.log('\n🏪 Creating demo operators...');

        const demoOperators = [
            {
                name: 'Vijay Prints',
                email: 'vijay@prints.com',
                phone: '+91-9876540001',
                password: 'password123',
                role: 'operator',
                shopName: 'Vijay Prints',
                isApproved: true,
                isActive: true
            },
            {
                name: 'Print Hub',
                email: 'printhub@shop.com',
                phone: '+91-9876540002',
                password: 'password123',
                role: 'operator',
                shopName: 'Print Hub',
                isApproved: true,
                isActive: true
            }
        ];

        const createdOperators = [];
        for (const opData of demoOperators) {
            const existing = await User.findOne({ email: opData.email });
            if (!existing) {
                const operator = new User(opData);
                await operator.save();
                createdOperators.push(operator);
                console.log(`✅ Created: ${opData.shopName}`);
            } else {
                createdOperators.push(existing);
                console.log(`ℹ️  Already exists: ${opData.shopName}`);
            }
        }

        // ==========================================
        // 3. CREATE DEMO CUSTOMERS
        // ==========================================
        console.log('\n👥 Creating demo customers...');

        const demoCustomers = [
            {
                name: 'Rahul Sharma',
                email: 'rahul@customer.com',
                phone: '+91-9876550001',
                password: 'password123',
                role: 'user'
            },
            {
                name: 'Neha Gupta',
                email: 'neha@customer.com',
                phone: '+91-9876550002',
                password: 'password123',
                role: 'user'
            }
        ];

        const createdCustomers = [];
        for (const custData of demoCustomers) {
            const existing = await User.findOne({ email: custData.email });
            if (!existing) {
                const customer = new User(custData);
                await customer.save();
                createdCustomers.push(customer);
                console.log(`✅ Created: ${custData.name}`);
            } else {
                createdCustomers.push(existing);
                console.log(`ℹ️  Already exists: ${custData.name}`);
            }
        }

        // ==========================================
        // 4. CREATE DEMO ORDERS
        // ==========================================
        console.log('\n📋 Creating demo orders...');

        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // Hot Orders (PRINTED, unassigned) - 3 orders
        const hotOrders = [
            {
                orderNumber: `ORD${Date.now()}001`,
                userId: createdCustomers[0]._id,
                assignedOperator: createdOperators[0]._id,
                orderStatus: 'printed',
                deliveryStatus: 'pending',
                deliveryOption: 'delivery',
                paymentMethod: 'online',
                paymentStatus: 'completed',
                totalAmount: 250,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '123 Main St',
                    city: 'Civil Lines',
                    state: 'UP',
                    pincode: '110001',
                    country: 'India'
                },
                createdAt: new Date(now - 25 * 60000), // 25 mins ago (RED BLINK)
                updatedAt: new Date(now - 25 * 60000)
            },
            {
                orderNumber: `ORD${Date.now()}002`,
                userId: createdCustomers[1]._id,
                assignedOperator: createdOperators[1]._id,
                orderStatus: 'printed',
                deliveryStatus: 'pending',
                deliveryOption: 'delivery',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                totalAmount: 180,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '456 Park Ave',
                    city: 'Sadar Bazar',
                    state: 'UP',
                    pincode: '110002',
                    country: 'India'
                },
                createdAt: new Date(now - 12 * 60000), // 12 mins ago (YELLOW)
                updatedAt: new Date(now - 12 * 60000)
            },
            {
                orderNumber: `ORD${Date.now()}003`,
                userId: createdCustomers[0]._id,
                assignedOperator: createdOperators[0]._id,
                orderStatus: 'printed',
                deliveryStatus: 'pending',
                deliveryOption: 'delivery',
                paymentMethod: 'online',
                paymentStatus: 'completed',
                totalAmount: 320,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '789 Lake Rd',
                    city: 'Kamla Nagar',
                    state: 'UP',
                    pincode: '110003',
                    country: 'India'
                },
                createdAt: new Date(now - 3 * 60000), // 3 mins ago (WHITE)
                updatedAt: new Date(now - 3 * 60000)
            }
        ];

        for (const orderData of hotOrders) {
            const order = new Order(orderData);
            await order.save();
            console.log(`✅ Hot Order: ${orderData.orderNumber} (waiting ${Math.floor((now - orderData.createdAt) / 60000)} mins)`);
        }

        // Pending Pickup Orders (assigned to Ravi, not picked) - 2 orders
        const pendingOrders = [
            {
                orderNumber: `ORD${Date.now()}004`,
                userId: createdCustomers[0]._id,
                assignedOperator: createdOperators[0]._id,
                assignedDeliveryPerson: createdRiders[0]._id, // Ravi
                orderStatus: 'printed',
                deliveryStatus: 'assigned',
                deliveryOption: 'delivery',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                totalAmount: 200,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '321 River St',
                    city: 'Model Town',
                    state: 'UP',
                    pincode: '110004',
                    country: 'India'
                },
                createdAt: new Date(now - 15 * 60000),
                updatedAt: new Date(now - 15 * 60000)
            },
            {
                orderNumber: `ORD${Date.now()}005`,
                userId: createdCustomers[1]._id,
                assignedOperator: createdOperators[1]._id,
                assignedDeliveryPerson: createdRiders[0]._id, // Ravi
                orderStatus: 'printed',
                deliveryStatus: 'assigned',
                deliveryOption: 'delivery',
                paymentMethod: 'online',
                paymentStatus: 'completed',
                totalAmount: 150,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '654 Hill Rd',
                    city: 'Rajouri Garden',
                    state: 'UP',
                    pincode: '110005',
                    country: 'India'
                },
                createdAt: new Date(now - 5 * 60000),
                updatedAt: new Date(now - 5 * 60000)
            }
        ];

        for (const orderData of pendingOrders) {
            const order = new Order(orderData);
            await order.save();
            console.log(`✅ Pending Pickup: ${orderData.orderNumber} (Ravi Kumar)`);
        }

        // Ongoing Orders (out for delivery) - 1 for Ravi, 3 for Suresh
        const ongoingOrders = [
            {
                orderNumber: `ORD${Date.now()}006`,
                userId: createdCustomers[0]._id,
                assignedOperator: createdOperators[0]._id,
                assignedDeliveryPerson: createdRiders[0]._id, // Ravi
                orderStatus: 'out_for_delivery',
                deliveryStatus: 'in-transit',
                deliveryOption: 'delivery',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                totalAmount: 300,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '987 Valley Rd',
                    city: 'Pitampura',
                    state: 'UP',
                    pincode: '110006',
                    country: 'India'
                },
                createdAt: new Date(now - 30 * 60000),
                updatedAt: new Date(now - 10 * 60000)
            },
            {
                orderNumber: `ORD${Date.now()}007`,
                userId: createdCustomers[1]._id,
                assignedOperator: createdOperators[1]._id,
                assignedDeliveryPerson: createdRiders[1]._id, // Suresh
                orderStatus: 'out_for_delivery',
                deliveryStatus: 'in-transit',
                deliveryOption: 'delivery',
                paymentMethod: 'online',
                paymentStatus: 'completed',
                totalAmount: 220,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '111 Beach Rd',
                    city: 'Rohini',
                    state: 'UP',
                    pincode: '110007',
                    country: 'India'
                },
                createdAt: new Date(now - 25 * 60000),
                updatedAt: new Date(now - 8 * 60000)
            },
            {
                orderNumber: `ORD${Date.now()}008`,
                userId: createdCustomers[0]._id,
                assignedOperator: createdOperators[0]._id,
                assignedDeliveryPerson: createdRiders[1]._id, // Suresh
                orderStatus: 'out_for_delivery',
                deliveryStatus: 'in-transit',
                deliveryOption: 'delivery',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                totalAmount: 180,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '222 Forest Ave',
                    city: 'Dwarka',
                    state: 'UP',
                    pincode: '110008',
                    country: 'India'
                },
                createdAt: new Date(now - 20 * 60000),
                updatedAt: new Date(now - 5 * 60000)
            },
            {
                orderNumber: `ORD${Date.now()}009`,
                userId: createdCustomers[1]._id,
                assignedOperator: createdOperators[1]._id,
                assignedDeliveryPerson: createdRiders[1]._id, // Suresh (BUSY - 3 orders)
                orderStatus: 'out_for_delivery',
                deliveryStatus: 'in-transit',
                deliveryOption: 'delivery',
                paymentMethod: 'online',
                paymentStatus: 'completed',
                totalAmount: 270,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: '333 Garden St',
                    city: 'Janakpuri',
                    state: 'UP',
                    pincode: '110009',
                    country: 'India'
                },
                createdAt: new Date(now - 15 * 60000),
                updatedAt: new Date(now - 3 * 60000)
            }
        ];

        for (const orderData of ongoingOrders) {
            const order = new Order(orderData);
            await order.save();
            const riderName = createdRiders.find(r => r._id.equals(orderData.assignedDeliveryPerson))?.name;
            console.log(`✅ Ongoing: ${orderData.orderNumber} (${riderName})`);
        }

        // Delivered Today (COD collected) - 12 for Ravi, 8 for Suresh
        console.log('\n📦 Creating delivered orders (today)...');

        const deliveredCount = { ravi: 12, suresh: 8 };
        let totalDelivered = 0;

        // Ravi's deliveries
        for (let i = 0; i < deliveredCount.ravi; i++) {
            const deliveryTime = new Date(todayStart.getTime() + (i + 1) * 30 * 60000); // Every 30 mins
            const order = new Order({
                orderNumber: `ORD${Date.now()}${100 + i}`,
                userId: createdCustomers[i % 2]._id,
                assignedOperator: createdOperators[i % 2]._id,
                assignedDeliveryPerson: createdRiders[0]._id, // Ravi
                orderStatus: 'delivered',
                deliveryStatus: 'delivered',
                deliveryOption: 'delivery',
                paymentMethod: 'cod',
                paymentStatus: 'completed',
                totalAmount: 200 + (i * 50),
                deliveryTime,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: `${i + 1} Test St`,
                    city: 'Delhi',
                    state: 'UP',
                    pincode: '110010',
                    country: 'India'
                },
                createdAt: new Date(deliveryTime - 40 * 60000),
                updatedAt: deliveryTime
            });
            await order.save();
            totalDelivered++;
        }

        // Suresh's deliveries
        for (let i = 0; i < deliveredCount.suresh; i++) {
            const deliveryTime = new Date(todayStart.getTime() + (i + 1) * 35 * 60000); // Every 35 mins
            const order = new Order({
                orderNumber: `ORD${Date.now()}${200 + i}`,
                userId: createdCustomers[i % 2]._id,
                assignedOperator: createdOperators[i % 2]._id,
                assignedDeliveryPerson: createdRiders[1]._id, // Suresh
                orderStatus: 'delivered',
                deliveryStatus: 'delivered',
                deliveryOption: 'delivery',
                paymentMethod: 'cod',
                paymentStatus: 'completed',
                totalAmount: 150 + (i * 30),
                deliveryTime,
                specifications: { pages: 10, copies: 1, colorType: "color", paperSize: "A4", bindingType: "none" },
                deliveryAddress: {
                    street: `${i + 1} Sample Ave`,
                    city: 'Delhi',
                    state: 'UP',
                    pincode: '110011',
                    country: 'India'
                },
                createdAt: new Date(deliveryTime - 45 * 60000),
                updatedAt: deliveryTime
            });
            await order.save();
            totalDelivered++;
        }

        console.log(`✅ Created ${totalDelivered} delivered orders`);

        // ==========================================
        // SUMMARY
        // ==========================================
        console.log('\n\n🎉 DEMO DATA CREATED SUCCESSFULLY!');
        console.log('\n📊 Summary:');
        console.log(`   Delivery Boys: ${createdRiders.length} (3 online, 1 offline)`);
        console.log(`   Operators: ${createdOperators.length}`);
        console.log(`   Customers: ${createdCustomers.length}`);
        console.log(`   Hot Orders: 3 (unassigned, PRINTED)`);
        console.log(`   Pending Pickup: 2 (Ravi)`);
        console.log(`   Ongoing: 4 (1 Ravi, 3 Suresh - BUSY)`);
        console.log(`   Delivered Today: ${totalDelivered} (12 Ravi, 8 Suresh)`);
        console.log('\n💰 Cash in Hand:');
        console.log(`   Ravi: ₹${12 * 200 + 300} (12 COD + 1 ongoing)`);
        console.log(`   Suresh: ₹${8 * 150} (8 COD)`);

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addDemoData();
