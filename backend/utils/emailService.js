/**
 * Email Service
 * Send email notifications using Nodemailer
 */

const nodemailer = require('nodemailer');

// Create transporter - only if email credentials are configured
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
}


/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (order, user) => {
  try {
    if (!transporter) {
      console.log('Email service not configured, skipping order confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"Printvik" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Order Confirmed!</h2>
          <p>Hi ${user.name},</p>
          <p>Your print order has been confirmed successfully.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Print Type:</strong> ${order.specifications.colorType === 'color' ? 'Color' : 'Black & White'}</p>
            <p><strong>Pages:</strong> ${order.specifications.pages}</p>
            <p><strong>Copies:</strong> ${order.specifications.copies}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery'}</p>
          </div>
          
          <p>We'll notify you once your order is ready for ${order.deliveryOption === 'delivery' ? 'delivery' : 'pickup'}.</p>
          
          <p>Thank you for choosing Printvik!</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update email
 */
const sendStatusUpdate = async (order, user, newStatus) => {
  try {
    if (!transporter) {
      console.log('Email service not configured, skipping status update email');
      return { success: false, error: 'Email service not configured' };
    }

    const statusMessages = {
      processing: 'Your order is being processed',
      printing: 'Your order is being printed',
      printed: 'Your order has been printed',
      'quality-check': 'Your order is undergoing quality check',
      ready: 'Your order is ready',
      'assigned-for-delivery': 'Your order has been assigned for delivery',
      'picked-up': 'Your order has been picked up',
      'in-transit': 'Your order is on the way',
      delivered: 'Your order has been delivered',
    };

    const mailOptions = {
      from: `"Printvik" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Order Status Updated</h2>
          <p>Hi ${user.name},</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; margin: 0;"><strong>${statusMessages[newStatus] || 'Order status updated'}</strong></p>
            <p style="color: #6B7280; margin-top: 10px;">Order Number: ${order.orderNumber}</p>
          </div>
          
          <p>Thank you for your patience!</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send operator assignment notification
 */
const sendOperatorAssignment = async (order, operator) => {
  try {
    const mailOptions = {
      from: `"Printvik" <${process.env.EMAIL_USER}>`,
      to: operator.email,
      subject: `New Print Job Assigned - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Print Job Assigned</h2>
          <p>Hi ${operator.name},</p>
          <p>A new print job has been assigned to you.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Job Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Print Type:</strong> ${order.specifications.colorType === 'color' ? 'Color' : 'Black & White'}</p>
            <p><strong>Pages:</strong> ${order.specifications.pages}</p>
            <p><strong>Copies:</strong> ${order.specifications.copies}</p>
            ${order.specifications.binding !== 'none' ? `<p><strong>Binding:</strong> ${order.specifications.binding}</p>` : ''}
          </div>
          
          <p>Please log in to your dashboard to view the complete details and start processing.</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Operator assignment email sent to ${operator.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending operator assignment email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send delivery assignment notification
 */
const sendDeliveryAssignment = async (order, deliveryPerson) => {
  try {
    const mailOptions = {
      from: `"Printvik" <${process.env.EMAIL_USER}>`,
      to: deliveryPerson.email,
      subject: `New Delivery Assigned - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Delivery Assigned</h2>
          <p>Hi ${deliveryPerson.name},</p>
          <p>A new delivery has been assigned to you.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Delivery Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Delivery Address:</strong><br>
            ${order.deliveryAddress.addressLine1}<br>
            ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
            ${order.paymentMethod === 'cod' ? `<p><strong>COD Amount:</strong> ₹${order.totalAmount}</p>` : ''}
          </div>
          
          <p>Please log in to your dashboard to view complete details and start the delivery.</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Delivery assignment email sent to ${deliveryPerson.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending delivery assignment email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendStatusUpdate,
  sendOperatorAssignment,
  sendDeliveryAssignment,
};
