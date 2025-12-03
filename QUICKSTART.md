# Printvik - Quick Start Guide

## What's Been Built

### ✅ Complete Backend API
- Full REST API with 7 route modules
- 7 database models
- Authentication, file upload, payments
- All business logic implemented

### ✅ Complete Client App  
- 6 pages (Login, Register, Home, NewOrder, OrderTracking, OrderHistory, Profile)
- Clean minimal design
- Full API integration
- Order management

## Testing the Current Build

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and add:
# - MongoDB URI (install MongoDB if needed)
# - JWT_SECRET (any random string)
# - Other API keys (optional for now)

# Start server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Client App Setup

```bash
# Navigate to client app
cd client-app

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start app
npm run dev
```

Client app will run on `http://localhost:5173`

### 3. Test the App

1. Open `http://localhost:5173`
2. Click "Register" and create an account
3. Login with your credentials
4. Create a new print order
5. View order tracking
6. Check order history
7. Manage profile and addresses

## What's Next

3 more dashboards need to be built:
- Operator Dashboard
- Delivery Dashboard  
- Admin Dashboard

These will follow the same pattern as the client app.

## Project Structure

```
printvik/
├── backend/              ✅ Complete
│   ├── models/          (7 models)
│   ├── routes/          (7 route modules)
│   ├── middleware/      (auth, upload)
│   └── config/          (database)
│
├── client-app/          ✅ Complete
│   ├── src/
│   │   ├── pages/      (6 pages)
│   │   ├── services/   (API integration)
│   │   └── store/      (auth state)
│   └── package.json
│
├── operator-dashboard/  🚧 To be built
├── delivery-dashboard/  🚧 To be built
└── admin-dashboard/     🚧 To be built
```

## Need Help?

- Backend code is in `/backend`
- Client app code is in `/client-app`
- All code has detailed comments
- Check README files in each directory
