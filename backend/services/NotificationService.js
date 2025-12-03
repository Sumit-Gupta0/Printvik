/**
 * Notification Service
 * Centralized service for sending multi-channel notifications
 * Handles template fetching, variable replacement, and provider integration
 */

const NotificationTemplate = require('../models/NotificationTemplate');
const NotificationLog = require('../models/NotificationLog');
const AdminAlert = require('../models/AdminAlert');

class NotificationService {
    constructor() {
        this.io = null;
    }

    setSocket(io) {
        this.io = io;
    }

    /**
     * Emit event to a specific socket room
     * @param {String} room - Room name
     * @param {String} event - Event name
     * @param {Object} data - Data payload
     */
    emitToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
    /**
     * Send notification based on event template
     * @param {String} eventKey - Event identifier (e.g., "ORDER_PLACED")
     * @param {Object} user - User object with phone, email, fcmToken
     * @param {Object} data - Variables to replace in template
     * @returns {Promise<Object>} - Result of notification sending
     */
    async send(eventKey, user, data) {
        try {
            // 0. Rate Limiting (Anti-Spam for Marketing)
            if (eventKey === 'MARKETING_CAMPAIGN' || eventKey.startsWith('MARKETING_')) {
                await this._checkRateLimit(user._id);
            }

            // 1. Fetch template from database
            const template = await NotificationTemplate.findOne({
                eventKey: eventKey.toUpperCase(),
                isActive: true
            });

            if (!template) {
                console.error(`Template not found for event: ${eventKey}`);
                return { success: false, error: 'Template not found' };
            }

            // 2. Validate required variables
            const missingVars = this._validateVariables(template.variables, data);
            if (missingVars.length > 0) {
                console.warn(`Missing variables for ${eventKey}:`, missingVars);
            }

            // 3. Prepare recipient info
            const recipient = {
                userId: user?._id,
                phone: user?.phone,
                email: user?.email,
                fcmToken: user?.fcmToken
            };

            // 4. Send via enabled channels
            const results = {
                sms: null,
                email: null,
                push: null,
                inApp: null
            };

            const channelsSent = [];

            // SMS Channel
            if (template.channels.sms.isEnabled && recipient.phone) {
                const message = this._replaceVariables(template.channels.sms.template, data);
                results.sms = await this._withRetry(() => this._sendSMS(recipient.phone, message));
                if (results.sms.sent) channelsSent.push('SMS');
            }

            // Email Channel
            if (template.channels.email.isEnabled && recipient.email) {
                const subject = this._replaceVariables(template.channels.email.subject, data);
                const body = this._replaceVariables(template.channels.email.body, data);
                results.email = await this._withRetry(() => this._sendEmail(recipient.email, subject, body));
                if (results.email.sent) channelsSent.push('EMAIL');
            }

            // Push Channel
            if (template.channels.push.isEnabled && recipient.fcmToken) {
                const title = this._replaceVariables(template.channels.push.title, data);
                const body = this._replaceVariables(template.channels.push.body, data);
                results.push = await this._withRetry(() => this._sendPush(recipient.fcmToken, title, body));
                if (results.push.sent) channelsSent.push('PUSH');
            }

            // In-App Channel
            if (template.channels.inApp.isEnabled && recipient.userId) {
                const message = this._replaceVariables(template.channels.inApp.message, data);
                results.inApp = await this._sendInApp(recipient.userId, message); // No retry needed for DB op usually
                if (results.inApp.sent) channelsSent.push('IN_APP');
            }

            // 5. Determine overall status
            const status = this._determineStatus(results);

            // 6. Log the notification
            await this._logNotification({
                recipient,
                event: eventKey,
                channelsSent,
                status,
                metadata: results,
                templateData: data
            });

            return {
                success: status !== 'FAILED',
                status,
                channelsSent,
                results
            };

        } catch (error) {
            console.error('NotificationService.send error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send admin alert (for operational notifications)
     * @param {String} type - CRITICAL, WARNING, INFO
     * @param {String} title - Alert title
     * @param {String} message - Alert message
     * @param {String} link - Deep link to admin page
     * @param {Object} relatedEntity - Related entity info
     * @returns {Promise<Object>} - Created alert
     */
    async sendAdminAlert(type, title, message, link = null, relatedEntity = null) {
        try {
            const alert = await AdminAlert.create({
                type,
                title,
                message,
                link,
                relatedEntity
            });

            // Emit Socket.io event for real-time updates
            if (this.io) {
                this.io.to('admin_room').emit('new_alert', alert);
            }

            return { success: true, alert };
        } catch (error) {
            console.error('sendAdminAlert error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Replace template variables with actual data
     * Uses regex to find {{variableName}} and replace with data[variableName]
     * @param {String} template - Template string with {{variables}}
     * @param {Object} data - Data object with variable values
     * @returns {String} - Processed string
     */
    _replaceVariables(template, data) {
        if (!template) return '';

        /**
         * Regex explanation:
         * {{      - Match opening braces
         * \s*     - Match optional whitespace
         * (\w+)   - Capture variable name (alphanumeric + underscore)
         * \s*     - Match optional whitespace
         * }}      - Match closing braces
         * 
         * Example: "Hi {{userName}}, order {{orderId}}" 
         * becomes "Hi John, order #123"
         */
        return template.replace(/{{\s*(\w+)\s*}}/g, (match, variable) => {
            return data[variable] !== undefined ? data[variable] : match;
        });
    }

    /**
     * Validate that all required variables are present
     * @param {Array} requiredVars - Array of required variable names
     * @param {Object} data - Provided data
     * @returns {Array} - Array of missing variable names
     */
    _validateVariables(requiredVars, data) {
        return requiredVars.filter(varName => data[varName] === undefined);
    }

    /**
     * Send SMS via provider (Mock implementation)
     * TODO: Integrate with Twilio/MSG91
     * @param {String} phone - Phone number
     * @param {String} message - SMS message
     * @returns {Promise<Object>} - Result object
     */
    async _sendSMS(phone, message) {
        try {
            // Mock implementation - replace with actual provider
            console.log(`[SMS] To: ${phone}, Message: ${message}`);

            // TODO: Actual Twilio/MSG91 integration
            // const result = await twilioClient.messages.create({
            //     to: phone,
            //     from: process.env.TWILIO_PHONE,
            //     body: message
            // });

            return {
                sent: true,
                provider: 'mock',
                messageId: `SMS-${Date.now()}`
            };
        } catch (error) {
            console.error('SMS send error:', error);
            return {
                sent: false,
                provider: 'mock',
                error: error.message
            };
        }
    }

    /**
     * Send Email via provider (Mock implementation)
     * TODO: Integrate with SendGrid/SES/Nodemailer
     * @param {String} email - Email address
     * @param {String} subject - Email subject
     * @param {String} body - Email body (HTML)
     * @returns {Promise<Object>} - Result object
     */
    async _sendEmail(email, subject, body) {
        try {
            // Mock implementation - replace with actual provider
            console.log(`[EMAIL] To: ${email}, Subject: ${subject}`);

            // TODO: Actual SendGrid/Nodemailer integration
            // const result = await emailService.send({
            //     to: email,
            //     subject,
            //     html: body
            // });

            return {
                sent: true,
                provider: 'mock',
                messageId: `EMAIL-${Date.now()}`
            };
        } catch (error) {
            console.error('Email send error:', error);
            return {
                sent: false,
                provider: 'mock',
                error: error.message
            };
        }
    }

    /**
     * Send Push Notification via FCM (Mock implementation)
     * TODO: Integrate with Firebase Cloud Messaging
     * @param {String} fcmToken - FCM device token
     * @param {String} title - Notification title
     * @param {String} body - Notification body
     * @returns {Promise<Object>} - Result object
     */
    async _sendPush(fcmToken, title, body) {
        try {
            // Mock implementation - replace with actual FCM
            console.log(`[PUSH] To: ${fcmToken}, Title: ${title}`);

            // TODO: Actual FCM integration
            // const result = await admin.messaging().send({
            //     token: fcmToken,
            //     notification: { title, body }
            // });

            return {
                sent: true,
                provider: 'fcm',
                messageId: `PUSH-${Date.now()}`
            };
        } catch (error) {
            console.error('Push send error:', error);
            return {
                sent: false,
                provider: 'fcm',
                error: error.message
            };
        }
    }

    /**
     * Send In-App notification (stored in database)
     * @param {String} userId - User ID
     * @param {String} message - Notification message
     * @returns {Promise<Object>} - Result object
     */
    async _sendInApp(userId, message) {
        try {
            // TODO: Create in-app notification record
            console.log(`[IN-APP] To: ${userId}, Message: ${message}`);

            return {
                sent: true,
                messageId: `INAPP-${Date.now()}`
            };
        } catch (error) {
            console.error('In-app send error:', error);
            return {
                sent: false,
                error: error.message
            };
        }
    }

    /**
     * Determine overall notification status
     * @param {Object} results - Results from all channels
     * @returns {String} - SUCCESS, PARTIAL_FAILURE, or FAILED
     */
    _determineStatus(results) {
        const attempted = Object.values(results).filter(r => r !== null);
        const successful = attempted.filter(r => r.sent);

        if (successful.length === 0) return 'FAILED';
        if (successful.length < attempted.length) return 'PARTIAL_FAILURE';
        return 'SUCCESS';
    }

    /**
     * Check if user has exceeded marketing notification limit
     * @param {String} userId - User ID
     * @returns {Promise<void>}
     * @throws {Error} - If limit exceeded
     */
    async _checkRateLimit(userId) {
        const limit = 3;
        const windowHours = 24;
        const dateThreshold = new Date();
        dateThreshold.setHours(dateThreshold.getHours() - windowHours);

        const count = await NotificationLog.countDocuments({
            'recipient.userId': userId,
            event: { $regex: /^MARKETING_/ },
            createdAt: { $gte: dateThreshold }
        });

        if (count >= limit) {
            throw new Error(`Rate limit exceeded: Max ${limit} marketing messages per ${windowHours}h`);
        }
    }

    /**
     * Execute function with exponential backoff retry
     * @param {Function} fn - Async function to execute
     * @param {Number} retries - Max retries
     * @returns {Promise<any>} - Function result
     */
    async _withRetry(fn, retries = 2) {
        for (let i = 0; i <= retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries) throw error;

                const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
                await this._wait(delay);
            }
        }
    }

    /**
     * Wait for specified milliseconds
     * @param {Number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Log notification to database
     * @param {Object} logData - Notification log data
     * @returns {Promise<void>}
     */
    async _logNotification(logData) {
        try {
            await NotificationLog.create(logData);
        } catch (error) {
            console.error('Failed to log notification:', error);
        }
    }
}

// Export singleton instance
module.exports = new NotificationService();
