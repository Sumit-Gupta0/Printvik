# Printvik Platform - Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites

Before testing, ensure you have:
- ✅ Node.js (v14+) installed
- ✅ MongoDB installed and running
- ✅ All dependencies installed

### Step 1: Start MongoDB

```bash
# Check if MongoDB is running
pgrep -x mongod

# If not running, start it
# On Mac with Homebrew:
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf
```

### Step 2: Setup Backend

```bash
cd backend

# Dependencies are already installed ✅

# Check .env file exists
ls -la .env

# If port 5000 is in use, kill the process:
lsof -ti:5000 | xargs kill -9

# Start backend server
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📍 Environment: development
✅ MongoDB Connected: localhost
```

### Step 3: Test Backend API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Printvik API is running",
  "timestamp": "2024-..."
}
```

### Step 4: Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 5: Setup Client App

```bash
cd client-app

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start client app
npm run dev
```

**Runs on:** http://localhost:5173

### Step 6: Test Client App

1. Open browser: http://localhost:5173
2. Click "Register"
3. Fill in the form:
   - Name: Test Customer
   - Email: customer@test.com
   - Phone: 9876543210
   - Password: password123
4. Click "Create Account"
5. Should redirect to home dashboard

### Step 7: Test Order Creation

1. Click "Create New Order"
2. Upload a test PDF file
3. Configure:
   - Print Type: Black & White
   - Paper Size: A4
   - Pages: 5
   - Copies: 2
4. Select delivery option
5. Choose payment method (COD for testing)
6. Click "Place Order"
7. Should see order confirmation

### Step 8: Setup Operator Dashboard

```bash
cd operator-dashboard

# Install dependencies
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start operator dashboard
npm run dev
```

**Runs on:** http://localhost:3002

### Step 9: Create Test Operator

In backend terminal or using curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Operator",
    "email": "operator@test.com",
    "phone": "9876543211",
    "password": "password123",
    "role": "operator"
  }'
```

### Step 10: Test Operator Dashboard

1. Open: http://localhost:3002
2. Login with operator@test.com / password123
3. Should see print queue (empty initially)
4. Assign an order to this operator via admin or database

### Step 11: Setup Delivery Dashboard

```bash
cd delivery-dashboard

npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

**Runs on:** http://localhost:3003

### Step 12: Setup Admin Dashboard

```bash
cd admin-dashboard

npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

**Runs on:** http://localhost:3001

### Step 13: Create Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@printvik.com",
    "phone": "9876543212",
    "password": "admin123",
    "role": "admin"
  }'
```

### Step 14: Test Admin Dashboard

1. Open: http://localhost:3001
2. Login with admin@printvik.com / admin123
3. Navigate to:
   - Dashboard (overview)
   - Orders (view all orders)
   - Users (manage users)
   - Analytics (view stats)

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env:
PORT=5001
```

### MongoDB Connection Error

```bash
# Check MongoDB status
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Or check if mongod is running
ps aux | grep mongod
```

### CORS Errors

Make sure backend .env has correct frontend URLs:
```
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:3001
OPERATOR_URL=http://localhost:3002
DELIVERY_URL=http://localhost:3003
```

### File Upload Errors

Ensure uploads directory exists:
```bash
cd backend
mkdir -p uploads
```

## ✅ Testing Checklist

- [ ] Backend server starts successfully
- [ ] MongoDB connection established
- [ ] User registration works
- [ ] User login works
- [ ] Client app loads
- [ ] Order creation works
- [ ] File upload works
- [ ] Price calculator works
- [ ] Order tracking works
- [ ] Operator dashboard loads
- [ ] Operator can view jobs
- [ ] Delivery dashboard loads
- [ ] Admin dashboard loads
- [ ] Admin can view analytics
- [ ] Admin can view users
- [ ] Admin can view orders

## 📊 Test Data

### Test Users Created

1. **Customer**: customer@test.com / password123
2. **Operator**: operator@test.com / password123
3. **Delivery**: delivery@test.com / password123
4. **Admin**: admin@printvik.com / admin123

### Test Scenarios

1. **Complete Order Flow:**
   - Customer creates order
   - Admin assigns to operator
   - Operator processes order
   - Admin assigns delivery
   - Delivery partner delivers

2. **Payment Testing:**
   - Test COD orders
   - Test online payment flow (mock)

3. **Role-Based Access:**
   - Verify each role can only access their dashboard
   - Test unauthorized access attempts

## 🎯 Next Steps After Testing

1. Fix any bugs found
2. Add missing features
3. Improve error handling
4. Add loading states
5. Optimize performance
6. Prepare for deployment

## 📝 Notes

- All passwords are hashed with bcrypt
- JWT tokens expire in 30 days
- File uploads limited to 10MB
- Supported file types: PDF, DOC, DOCX, JPG, PNG
