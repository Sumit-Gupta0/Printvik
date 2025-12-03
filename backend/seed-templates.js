const mongoose = require('mongoose');
const NotificationTemplate = require('./models/NotificationTemplate');
require('dotenv').config();

const templates = [
    {
        eventKey: 'MARKETING_CAMPAIGN',
        description: 'Marketing campaign notification',
        channels: {
            push: {
                isEnabled: true,
                title: '{{title}}',
                body: '{{message}}'
            },
            inApp: {
                isEnabled: true,
                message: '{{title}}: {{message}}'
            },
            email: {
                isEnabled: false,
                subject: '{{title}}',
                body: '{{message}}'
            },
            sms: {
                isEnabled: false,
                template: '{{message}}'
            }
        },
        variables: ['title', 'message', 'image'],
        isActive: true
    },
    {
        eventKey: 'WELCOME_USER',
        description: 'Welcome message for new users',
        channels: {
            email: {
                isEnabled: true,
                subject: 'Welcome to PrintVik!',
                body: 'Hi {{name}},\n\nWelcome to PrintVik! We are excited to have you on board.\n\nBest,\nPrintVik Team'
            },
            sms: {
                isEnabled: true,
                template: 'Welcome {{name}} to PrintVik! Happy Printing.'
            }
        },
        variables: ['name']
    },
    {
        eventKey: 'ORDER_PLACED',
        description: 'Sent when a user places an order',
        channels: {
            email: {
                isEnabled: true,
                subject: 'Order Confirmation #{{orderNumber}}',
                body: 'Hi {{name}},\n\nYour order #{{orderNumber}} has been placed successfully. Total Amount: ₹{{amount}}.\n\nTrack here: {{trackingLink}}'
            },
            push: {
                isEnabled: true,
                title: 'Order Placed 🛍️',
                body: 'Your order #{{orderNumber}} is confirmed!'
            },
            inApp: {
                isEnabled: true,
                message: 'Order #{{orderNumber}} placed successfully.'
            }
        },
        variables: ['name', 'orderNumber', 'amount', 'trackingLink']
    },
    {
        eventKey: 'ORDER_STATUS_UPDATED',
        description: 'Sent when order status changes',
        channels: {
            push: {
                isEnabled: true,
                title: 'Order Update 📦',
                body: 'Your order #{{orderNumber}} is now {{status}}.'
            },
            inApp: {
                isEnabled: true,
                message: 'Order #{{orderNumber}} is {{status}}.'
            }
        },
        variables: ['orderNumber', 'status']
    },
    {
        eventKey: 'RIDER_ASSIGNED',
        description: 'Sent to rider when assigned an order',
        channels: {
            push: {
                isEnabled: true,
                title: 'New Delivery Assigned! 🛵',
                body: 'Order #{{orderNumber}} is ready for pickup at {{shopName}}.'
            },
            sms: {
                isEnabled: true,
                template: 'New Order: #{{orderNumber}}. Pickup from {{shopName}}.'
            }
        },
        variables: ['orderNumber', 'shopName']
    },
    {
        eventKey: 'KYC_UPDATE',
        description: 'Sent when KYC status is updated',
        channels: {
            email: {
                isEnabled: true,
                subject: 'KYC Status Update',
                body: 'Hi {{name}},\n\nYour KYC verification status is: {{status}}.\n\nReason/Notes: {{reason}}'
            },
            push: {
                isEnabled: true,
                title: 'KYC Update 🆔',
                body: 'Your KYC status is now {{status}}.'
            }
        },
        variables: ['name', 'status', 'reason']
    }
];

async function seedTemplates() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/printvik');
        console.log('✅ Connected to MongoDB');

        for (const tmpl of templates) {
            await NotificationTemplate.findOneAndUpdate(
                { eventKey: tmpl.eventKey },
                tmpl,
                { upsert: true, new: true }
            );
            console.log(`✅ Seeded: ${tmpl.eventKey}`);
        }

        console.log('🎉 Templates seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        process.exit(1);
    }
}

seedTemplates();
