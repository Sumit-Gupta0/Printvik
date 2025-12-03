# Printvik Backend API

Backend server for Printvik - Print Business Platform

## 🚀 Features

- **Multi-role Authentication**: Support for customers, operators, delivery partners, and admins
- **Order Management**: Complete order lifecycle from placement to delivery
- **Smart Operator Assignment**: Location and capacity-based assignment algorithm
- **Payment Integration**: Razorpay for online payments + COD support
- **Delivery Zone Management**: Configure serviceable areas
- **Operator Payouts**: Track and process operator earnings
- **Coupon System**: Discount codes and promotional campaigns
- **File Upload**: Document upload with validation
- **Notifications**: Email, Push, and WhatsApp integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Razorpay account (for payments)
- Twilio account (for WhatsApp)

## ⚙️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- MongoDB URI
- JWT Secret
- Razorpay credentials
- Twilio credentials
- Email configuration

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/addresses` - Add address

### Admin
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/service-types` - Create service type
- `POST /api/admin/delivery-zones` - Create delivery zone
- `POST /api/admin/coupons` - Create coupon

## 🗄️ Database Models

- **User**: Multi-role user model
- **Order**: Complete order tracking
- **Address**: Customer addresses
- **ServiceType**: Dynamic service management
- **PricingConfig**: Admin-controlled pricing
- **Coupon**: Discount codes
- **DeliveryZone**: Serviceable areas
- **OperatorPayout**: Earnings tracking

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- CORS configuration

## 📝 License

ISC
