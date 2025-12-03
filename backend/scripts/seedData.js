const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Order = require('../models/Order');
const ServiceType = require('../models/ServiceType');
const Address = require('../models/Address');

// Load env vars
dotenv.config({ path: './.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Order.deleteMany({});
        await ServiceType.deleteMany({});
        await Address.deleteMany({});

        console.log('Creating demo data...');

        // 1. Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@printvik.com',
            phone: '9876543210',
            password: 'admin123',
            role: 'admin',
            isApproved: true,
            isActive: true
        });
        console.log('✓ Admin created');

        // 2. Create End Users
        const endUsers = await User.create([
            {
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '9876543211',
                password: 'user123',
                role: 'user',
                isApproved: true,
                isActive: true
            },
            {
                name: 'Priya Singh',
                email: 'priya@example.com',
                phone: '9876543212',
                password: 'user123',
                role: 'user',
                isApproved: true,
                isActive: true
            },
            {
                name: 'Amit Patel',
                email: 'amit@example.com',
                phone: '9876543213',
                password: 'user123',
                role: 'user',
                isApproved: true,
                isActive: true
            }
        ]);
        console.log('✓ End users created');

        // 3. Create Operators
        const operators = await User.create([
            {
                name: 'Vijay Print Shop',
                email: 'vijay@printshop.com',
                phone: '9876543214',
                password: 'operator123',
                role: 'operator',
                isApproved: true,
                isActive: true,
                operatorLocation: {
                    lat: 28.6139,
                    lng: 77.2090,
                    address: 'Connaught Place, New Delhi'
                },
                maxCapacity: 15,
                currentLoad: 3
            },
            {
                name: 'Quick Print Center',
                email: 'quick@printcenter.com',
                phone: '9876543215',
                password: 'operator123',
                role: 'operator',
                isApproved: false,
                isActive: true,
                operatorLocation: {
                    lat: 28.5355,
                    lng: 77.3910,
                    address: 'Noida Sector 18'
                },
                maxCapacity: 10,
                currentLoad: 0
            }
        ]);
        console.log('✓ Operators created');

        // 4. Create Delivery Personnel
        const deliveryPersons = await User.create([
            {
                name: 'Ravi Kumar',
                email: 'ravi@delivery.com',
                phone: '9876543216',
                password: 'delivery123',
                role: 'delivery',
                isApproved: true,
                isActive: true,
                vehicleType: 'bike',
                currentLocation: {
                    lat: 28.6139,
                    lng: 77.2090
                }
            },
            {
                name: 'Suresh Yadav',
                email: 'suresh@delivery.com',
                phone: '9876543217',
                password: 'delivery123',
                role: 'delivery',
                isApproved: false,
                isActive: true,
                vehicleType: 'car'
            }
        ]);
        console.log('✓ Delivery personnel created');

        // 5. Create Addresses for End Users
        const addresses = [];
        for (let i = 0; i < endUsers.length; i++) {
            const addr = await Address.create({
                userId: endUsers[i]._id,
                name: 'Home',
                addressLine1: `${i + 1}, Sample Street`,
                addressLine2: 'Near Market',
                city: 'Delhi',
                state: 'Delhi',
                pincode: `11000${i}`,
                phone: endUsers[i].phone,
                isDefault: true
            });
            addresses.push(addr);

            // Update user with address
            endUsers[i].addresses.push(addr._id);
            await endUsers[i].save();
        }
        console.log('✓ Addresses created');

        // 6. Create Service Types
        const serviceTypes = await ServiceType.create([
            {
                name: 'Black & White Printing',
                description: 'Standard B&W document printing',
                basePrice: 2,
                isActive: true
            },
            {
                name: 'Color Printing',
                description: 'High-quality color printing',
                basePrice: 5,
                isActive: true
            },
            {
                name: 'Scanning',
                description: 'Document scanning service',
                basePrice: 3,
                isActive: true
            }
        ]);
        console.log('✓ Service types created');

        // 7. Create Orders
        const orders = [];
        const statuses = ['pending', 'processing', 'printed', 'delivered', 'cancelled'];

        for (let i = 0; i < 15; i++) {
            const randomUser = endUsers[Math.floor(Math.random() * endUsers.length)];
            const randomOperator = operators[0]; // Use approved operator
            const randomDelivery = deliveryPersons[0]; // Use approved delivery
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const userAddress = addresses[endUsers.indexOf(randomUser)];

            const order = await Order.create({
                orderNumber: `ORD${1000 + i}`,
                userId: randomUser._id,
                documents: [
                    {
                        filename: `document_${i}.pdf`,
                        url: `/uploads/demo_doc_${i}.pdf`,
                        fileType: 'application/pdf',
                        uploadedAt: new Date()
                    }
                ],
                specifications: {
                    colorType: i % 2 === 0 ? 'bw' : 'color',
                    paperSize: 'A4',
                    copies: Math.floor(Math.random() * 5) + 1,
                    pages: Math.floor(Math.random() * 20) + 5,
                    binding: i % 4 === 0 ? 'spiral' : 'none'
                },
                instructions: i % 3 === 0 ? 'Please handle with care' : undefined,
                totalAmount: 105 + (i * 10) - (i % 5 === 0 ? 20 : 0),
                platformFee: 10,
                deliveryCharge: 30,
                discount: i % 5 === 0 ? { amount: 20, couponCode: 'DEMO20' } : undefined,
                paymentMethod: i % 2 === 0 ? 'online' : 'cod',
                paymentStatus: randomStatus === 'delivered' ? 'completed' : 'pending',
                orderStatus: randomStatus,
                assignedOperator: randomStatus !== 'pending' ? randomOperator._id : null,
                assignedDeliveryPerson: randomStatus === 'delivered' ? randomDelivery._id : null,
                deliveryOption: 'delivery',
                deliveryAddress: {
                    name: userAddress.name,
                    phone: userAddress.phone,
                    addressLine1: userAddress.addressLine1,
                    addressLine2: userAddress.addressLine2,
                    city: userAddress.city,
                    state: userAddress.state,
                    pincode: userAddress.pincode
                },
                deliveryStatus: randomStatus === 'delivered' ? 'delivered' : 'pending',
                estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                codAmount: i % 2 === 0 ? 0 : 105 + (i * 10),
                codCollected: randomStatus === 'delivered' && i % 2 !== 0,
                createdAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000) // Spread over 15 days
            });
            orders.push(order);
        }
        console.log('✓ Orders created');

        console.log('\n=================================');
        console.log('Demo Data Created Successfully!');
        console.log('=================================\n');
        console.log('Login Credentials:');
        console.log('------------------');
        console.log('Admin:');
        console.log('  Email: admin@printvik.com');
        console.log('  Password: admin123');
        console.log('  PIN: 009988\n');
        console.log('End Users:');
        console.log('  Email: rahul@example.com | Password: user123');
        console.log('  Email: priya@example.com | Password: user123');
        console.log('  Email: amit@example.com | Password: user123\n');
        console.log('Operators:');
        console.log('  Email: vijay@printshop.com | Password: operator123 (Approved)');
        console.log('  Email: quick@printcenter.com | Password: operator123 (Pending)\n');
        console.log('Delivery:');
        console.log('  Email: ravi@delivery.com | Password: delivery123 (Approved)');
        console.log('  Email: suresh@delivery.com | Password: delivery123 (Pending)\n');
        console.log(`Total Orders: ${orders.length}`);
        console.log('=================================\n');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedData();
