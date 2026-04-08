const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Order = require('../models/Order');

class WhatsAppBotService {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: './.whatsapp-session' }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });
        this.io = null;

        this.initialize();
    }

    setSocket(io) {
        this.io = io;
    }

    initialize() {
        this.client.on('qr', (qr) => {
            console.log('--- WHATSAPP BOT QR ---');
            console.log('Scan this QR code with WhatsApp to connect the bot:');
            qrcode.generate(qr, { small: true });
            console.log('-----------------------');
        });

        this.client.on('ready', () => {
            if (this.client.info && this.client.info.wid) {
                this.botNumber = this.client.info.wid.user;
            }
            console.log('✅ WhatsApp Bot is ready and listening for messages! Number:', this.botNumber);
        });

        this.client.on('message', async (msg) => {
            try {
                await this.handleMessage(msg);
            } catch (err) {
                console.error('Error handling WhatsApp message:', err);
                msg.reply("Sorry, there was an error processing your request.");
            }
        });

        this.client.initialize();
    }

    async handleMessage(msg) {
        // Only respond to private messages, not status or groups
        if (msg.from === 'status@broadcast' || msg.from.includes('@g.us')) {
            return;
        }

        // Extract phone number (e.g. 919999999999@c.us -> 9999999999)
        let phone = msg.from.split('@')[0];
        // Normalize: take last 10 digits as Indian numbers
        if (phone.length > 10) {
            phone = phone.substring(phone.length - 10);
        }

        if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            if (!media) return;

            // Find user by phone
            let user = await User.findOne({ phone: new RegExp(phone + '$') });
            
            if (!user) {
                // Return a friendly message asking them to register.
                msg.reply("Welcome to Printvik! We don't have an account registered with this number. Please register on the website first.");
                return;
            }

            // Find an active/pending order for this user, or create one
            let order = await Order.findOne({ userId: user._id, orderStatus: 'pending' }).sort({ createdAt: -1 });
            if (!order) {
                order = new Order({
                    userId: user._id,
                    orderStatus: 'pending',
                    paymentMethod: 'online', // Default
                    deliveryOption: 'pickup', // Default
                    totalAmount: 0 // Will be updated later
                });
                await order.save();
            }

            // Save media to disk
            const uploadsDir = path.join(__dirname, '../uploads/whatsapp');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const extension = media.mimetype.split('/')[1]?.split(';')[0] || 'bin';
            const filename = `wa_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
            const filepath = path.join(uploadsDir, filename);

            fs.writeFileSync(filepath, media.data, 'base64');

            const fileUrl = `/uploads/whatsapp/${filename}`;

            const document = {
                filename: (msg.body && msg.body.length < 50) ? `${msg.body.replace(/[^a-zA-Z0-9 ]/g, "")}.${extension}` : filename,
                url: fileUrl,
                fileType: media.mimetype,
                pageCount: 1 // default, can be parsed if pdf
            };

            order.documents.push(document);
            await order.save();

            // Emit socket event to update client app in real-time
            if (this.io) {
                this.io.emit('whatsapp_file_received', {
                    userId: user._id,
                    orderId: order._id,
                    document: document
                });
            }

            msg.reply(`✅ File received and added to your ongoing order! \nOrder number: ${order.orderNumber || order._id}\nWe'll notify you of the bill shortly.`);
        } else {
            // Text message handling
            let text = msg.body.toLowerCase().trim();
            if (text === 'bill' || text === 'payment') {
                let user = await User.findOne({ phone: new RegExp(phone + '$') });
                if (user) {
                    let order = await Order.findOne({ userId: user._id }).sort({ createdAt: -1 });
                    if (order) {
                        msg.reply(`🧾 Your last order details:\n\nOrder No: ${order.orderNumber || order._id}\nStatus: ${order.orderStatus.toUpperCase()}\nTotal Bill: ₹${order.totalAmount || 0}`);
                    } else {
                        msg.reply("You don't have any recent orders.");
                    }
                } else {
                    msg.reply("You are not registered with Printvik. Please register first.");
                }
            } else {
                msg.reply("👋 Welcome to Printvik WhatsApp Bot!\n\n📎 *Send any document/image* to automatically add it to your order.\n\n💰 Type *'bill'* or *'payment'* to check your latest order and total amount payable.");
            }
        }
    }
}

// Singleton export
module.exports = new WhatsAppBotService();
