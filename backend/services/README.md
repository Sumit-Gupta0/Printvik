# Notification Service Documentation

## Overview
The Notification Service is a centralized system for sending multi-channel notifications (SMS, Email, Push, In-App) based on event templates. It includes built-in rate limiting, retry mechanisms, and logging.

## Key Features
- **Multi-Channel Support**: SMS, Email, Push (FCM), In-App.
- **Template Engine**: Dynamic variable replacement (e.g., `{{userName}}`).
- **Rate Limiting**: Prevents spamming users (e.g., Max 3 marketing pushes/day).
- **Reliability**: Exponential backoff retry for failed provider calls.
- **Analytics**: Tracks delivery status and engagement.

## Adding a New Provider

### 1. SMS Provider (e.g., Switching to MSG91)
Modify `_sendSMS` in `NotificationService.js`:
```javascript
async _sendSMS(phone, message) {
    // Replace with MSG91 API call
    const response = await axios.post('https://api.msg91.com/api/v5/flow/', {
        template_id: 'YOUR_TEMPLATE_ID',
        recipients: [{ mobiles: phone, var: message }]
    }, { headers: { authkey: process.env.MSG91_KEY } });
    
    return { sent: true, provider: 'msg91', messageId: response.data.message_id };
}
```

### 2. Email Provider (e.g., SendGrid)
Modify `_sendEmail` in `NotificationService.js`:
```javascript
async _sendEmail(email, subject, body) {
    await sgMail.send({ to: email, from: 'noreply@printvik.com', subject, html: body });
    return { sent: true, provider: 'sendgrid' };
}
```

## Usage
```javascript
const NotificationService = require('./services/NotificationService');

await NotificationService.send('ORDER_PLACED', user, {
    orderId: '12345',
    amount: '₹500'
});
```
