/**
 * Main Express Server
 * Entry point for the Printvik backend API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { initBackupService } = require('./utils/backupService');
const systemGuard = require('./middleware/systemGuard');
const http = require('http');
const socketIo = require('socket.io');
const NotificationService = require('./services/NotificationService');
const WhatsAppBotService = require('./services/WhatsAppBotService');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL,
            process.env.ADMIN_URL,
            process.env.OPERATOR_URL,
            process.env.DELIVERY_URL,
            'http://10.135.245.131:5174',
            'http://10.135.245.131:5173',
            'http://10.135.245.131:3006'
        ],
        credentials: true
    }
});

// Pass Socket.io instance to NotificationService
NotificationService.setSocket(io);
WhatsAppBotService.setSocket(io);

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_admin', () => {
        socket.join('admin_room');
        console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on('join_operator', (operatorId) => {
        if (operatorId) {
            socket.join(`operator_${operatorId}`);
            console.log(`Socket ${socket.id} joined operator_${operatorId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Connect to Database
// Connect to Database
connectDB();

// Initialize Backup Service
initBackupService();

// Middleware
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        process.env.ADMIN_URL,
        process.env.OPERATOR_URL,
        process.env.DELIVERY_URL,
        'http://10.135.245.131:5174',
        'http://10.135.245.131:5173',
        'http://10.135.245.131:3006'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Latency Logger Middleware
app.use((req, res, next) => {
    const fs = require('fs');
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}\n`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Request Completed: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)\n`);
        console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// System Guard Middleware (Maintenance Mode & Feature Flags)
app.use(systemGuard);

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// WhatsApp Config API
app.get('/api/whatsapp/config', (req, res) => {
    const number = WhatsAppBotService.botNumber || process.env.WHATSAPP_BOT_NUMBER || '';
    res.json({ number });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/operators', require('./routes/operators'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/delivery-zones', require('./routes/deliveryZones'));
app.use('/api/products', require('./routes/products'));
app.use('/api/system', require('./routes/system'));


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Printvik API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
