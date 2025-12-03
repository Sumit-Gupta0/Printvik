const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Order = require('../models/Order');
const SystemConfig = require('../models/SystemConfig');
const ServiceType = require('../models/ServiceType');

const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const performBackup = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log(`[BACKUP] Starting backup at ${timestamp}...`);

    try {
        // 1. Backup Users
        const users = await User.find().lean();
        fs.writeFileSync(
            path.join(BACKUP_DIR, `users_${timestamp}.json`),
            JSON.stringify(users, null, 2)
        );

        // 2. Backup Orders
        const orders = await Order.find().lean();
        fs.writeFileSync(
            path.join(BACKUP_DIR, `orders_${timestamp}.json`),
            JSON.stringify(orders, null, 2)
        );

        // 3. Backup System Config
        const config = await SystemConfig.find().lean();
        fs.writeFileSync(
            path.join(BACKUP_DIR, `config_${timestamp}.json`),
            JSON.stringify(config, null, 2)
        );

        // 4. Backup Services
        const services = await ServiceType.find().lean();
        fs.writeFileSync(
            path.join(BACKUP_DIR, `services_${timestamp}.json`),
            JSON.stringify(services, null, 2)
        );

        console.log(`[BACKUP] Backup completed successfully! Files saved in ${BACKUP_DIR}`);
    } catch (error) {
        console.error('[BACKUP] Error performing backup:', error);
    }
};

const initBackupService = () => {
    // Schedule task to run at 00:00 every day
    cron.schedule('0 0 * * *', () => {
        performBackup();
    });

    console.log('[BACKUP] Backup service initialized (Schedule: Daily at 00:00)');
};

module.exports = { initBackupService, performBackup };
