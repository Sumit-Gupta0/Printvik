/**
 * Seed Default Notification Templates
 * Populates database with initial notification templates
 */

require('dotenv').config();
const mongoose = require('mongoose');
const NotificationTemplate = require('./models/NotificationTemplate');

const defaultTemplates = [
    {
        eventKey: 'ORDER_PLACED',
        description: 'Sent when user places a new order',
        channels: {
            sms: {
                isEnabled: true,
                template: 'Hi {{userName}}, your order #{{orderId}} has been placed successfully! Amount: ₹{{amount}}. Track your order in the app.'
            },
            email: {
                isEnabled: true,
                subject: 'Order Confirmation - #{{orderId}}',
                body: `
                    <h2>Order Placed Successfully!</h2>
                    <p>Hi {{userName}},</p>
                    <p>Your order <strong>#{{orderId}}</strong> has been received.</p>
                    <p><strong>Amount:</strong> ₹{{amount}}</p>
                    <p><strong>Shop:</strong> {{shopName}}</p>
                    <p>We'll notify you once your order is ready.</p>
                    <p>Thank you for choosing PrintVik!</p>
                `
            },
            push: {
                isEnabled: true,
                title: 'Order Placed Successfully',
                body: 'Your order #{{orderId}} is confirmed. Amount: ₹{{amount}}'
            },
            inApp: {
                isEnabled: true,
                message: 'Order #{{orderId}} placed successfully'
            }
        },
        variables: ['userName', 'orderId', 'amount', 'shopName']
    },
    {
        eventKey: 'ORDER_READY',
        description: 'Sent when order is ready for pickup/delivery',
        channels: {
            sms: {
                isEnabled: true,
                template: 'Hi {{userName}}, your order #{{orderId}} is ready at {{shopName}}! Please collect it soon.'
            },
            email: {
                isEnabled: false,
                subject: 'Order Ready - #{{orderId}}',
                body: '<p>Your order is ready for pickup!</p>'
            },
            push: {
                isEnabled: true,
                title: 'Order Ready!',
                body: 'Your order #{{orderId}} is ready at {{shopName}}'
            },
            inApp: {
                isEnabled: true,
                message: 'Order #{{orderId}} is ready for pickup'
            }
        },
        variables: ['userName', 'orderId', 'shopName']
    },
    {
        eventKey: 'RIDER_ASSIGNED',
        description: 'Sent when delivery rider is assigned',
        channels: {
            sms: {
                isEnabled: true,
                template: 'Hi {{userName}}, {{riderName}} is delivering your order #{{orderId}}. Vehicle: {{vehicleNumber}}. Track in app.'
            },
            email: {
                isEnabled: false,
                subject: 'Rider Assigned - #{{orderId}}',
                body: '<p>Your delivery is on the way!</p>'
            },
            push: {
                isEnabled: true,
                title: 'Rider Assigned',
                body: '{{riderName}} is delivering your order #{{orderId}}'
            },
            inApp: {
                isEnabled: true,
                message: 'Rider {{riderName}} assigned to order #{{orderId}}'
            }
        },
        variables: ['userName', 'orderId', 'riderName', 'vehicleNumber']
    },
    {
        eventKey: 'ORDER_DELIVERED',
        description: 'Sent when order is successfully delivered',
        channels: {
            sms: {
                isEnabled: true,
                template: 'Hi {{userName}}, your order #{{orderId}} has been delivered successfully! Thank you for using PrintVik.'
            },
            email: {
                isEnabled: true,
                subject: 'Order Delivered - #{{orderId}}',
                body: `
                    <h2>Order Delivered!</h2>
                    <p>Hi {{userName}},</p>
                    <p>Your order <strong>#{{orderId}}</strong> has been delivered successfully.</p>
                    <p>Thank you for choosing PrintVik!</p>
                    <p>We hope to serve you again soon.</p>
                `
            },
            push: {
                isEnabled: true,
                title: 'Order Delivered',
                body: 'Your order #{{orderId}} has been delivered. Thank you!'
            },
            inApp: {
                isEnabled: true,
                message: 'Order #{{orderId}} delivered successfully'
            }
        },
        variables: ['userName', 'orderId']
    },
    {
        eventKey: 'OTP_LOGIN',
        description: 'Sent when user requests OTP for login',
        channels: {
            sms: {
                isEnabled: true,
                template: 'Your PrintVik OTP is: {{otp}}. Valid for 5 minutes. Do not share with anyone.'
            },
            email: {
                isEnabled: false,
                subject: 'Your Login OTP',
                body: '<p>Your OTP: {{otp}}</p>'
            },
            push: {
                isEnabled: false,
                title: '',
                body: ''
            },
            inApp: {
                isEnabled: false,
                message: ''
            }
        },
        variables: ['otp']
    },
    {
        eventKey: 'ORDER_CANCELLED',
        description: 'Sent when order is cancelled',
        channels: {
            sms: {
                isEnabled: true,
                template: 'Hi {{userName}}, your order #{{orderId}} has been cancelled. Refund will be processed in 3-5 days.'
            },
            email: {
                isEnabled: true,
                subject: 'Order Cancelled - #{{orderId}}',
                body: `
                    <h2>Order Cancelled</h2>
                    <p>Hi {{userName}},</p>
                    <p>Your order <strong>#{{orderId}}</strong> has been cancelled.</p>
                    <p>Refund amount: ₹{{amount}}</p>
                    <p>Refund will be processed within 3-5 business days.</p>
                `
            },
            push: {
                isEnabled: true,
                title: 'Order Cancelled',
                body: 'Order #{{orderId}} cancelled. Refund in 3-5 days.'
            },
            inApp: {
                isEnabled: true,
                message: 'Order #{{orderId}} cancelled'
            }
        },
        variables: ['userName', 'orderId', 'amount']
    }
];

const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing templates (optional - remove in production)
        // await NotificationTemplate.deleteMany({});

        // Insert templates
        for (const template of defaultTemplates) {
            const existing = await NotificationTemplate.findOne({ eventKey: template.eventKey });

            if (existing) {
                console.log(`⏭️  Template ${template.eventKey} already exists`);
            } else {
                await NotificationTemplate.create(template);
                console.log(`✅ Created template: ${template.eventKey}`);
            }
        }

        console.log('\n✅ All notification templates seeded successfully!');
        console.log(`\n📊 Total templates: ${defaultTemplates.length}`);
        console.log('\nTemplates created:');
        defaultTemplates.forEach(t => {
            console.log(`  - ${t.eventKey}: ${t.description}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
