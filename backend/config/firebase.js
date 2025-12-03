const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
// NOTE: In production, you should use a service account key file
// For now, we'll use a placeholder or check if credentials exist in env
try {
    // Check if service account path is provided in env
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
        const serviceAccount = require(path.resolve(serviceAccountPath));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized with service account');
    } else {
        // Fallback for development without credentials
        console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not found. Firebase notifications will be mocked.');
        // We don't initialize app here to avoid errors, but we'll handle the missing app in the export
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
}

// Export messaging service wrapper
const messaging = {
    send: async (message) => {
        if (admin.apps.length > 0) {
            return admin.messaging().send(message);
        } else {
            console.log('[MOCK FCM] Notification sent:', JSON.stringify(message, null, 2));
            return 'mock-message-id';
        }
    }
};

module.exports = { messaging };
