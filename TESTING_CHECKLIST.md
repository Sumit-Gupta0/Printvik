# Printvik Platform - Testing Guide & Checklist

## 🧪 COMPREHENSIVE TESTING PLAN

### Pre-Testing Setup

#### 1. MongoDB Setup
```bash
# Check if MongoDB is installed
brew services list | grep mongodb

# If not installed:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
# Should show "started"
```

#### 2. Backend Setup
```bash
cd backend

# Dependencies already installed ✅

# Verify .env file exists
cat .env

# Start backend server
npm run dev

# Expected output:
# 🚀 Server running on port 5000
# 📍 Environment: development
# ✅ MongoDB Connected
```

#### 3. Frontend Apps Setup
```bash
# Client App
cd client-app
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
# Runs on http://localhost:5173

# Operator Dashboard (new terminal)
cd operator-dashboard
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
# Runs on http://localhost:3002

# Delivery Dashboard (new terminal)
cd delivery-dashboard
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
# Runs on http://localhost:3003

# Admin Dashboard (new terminal)
cd admin-dashboard
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
# Runs on http://localhost:3001
```

---

## ✅ TESTING CHECKLIST

### Phase 1: Backend API Testing

#### Test 1: Health Check
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"OK","message":"Printvik API is running"}`

#### Test 2: User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```
**Expected:** Success response with user data and JWT token

#### Test 3: User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```
**Expected:** Success with token

#### Test 4: Delivery Zone Check
```bash
curl http://localhost:5000/api/delivery-zones/check/110001
```
**Expected:** Delivery availability response

---

### Phase 2: Client App Testing

#### Test 1: Registration Flow
- [ ] Open http://localhost:5173
- [ ] Click "Register"
- [ ] Fill form with valid data
- [ ] Submit
- [ ] Verify redirect to home
- [ ] Check if user is logged in

#### Test 2: Login Flow
- [ ] Logout
- [ ] Click "Login"
- [ ] Enter credentials
- [ ] Submit
- [ ] Verify redirect to home

#### Test 3: Order Creation
- [ ] Click "Create New Order"
- [ ] Upload a PDF file
- [ ] Verify file appears in list
- [ ] Click "Preview" button
- [ ] Verify PDF preview opens
- [ ] Close preview
- [ ] Click "Remove" button
- [ ] Verify file is removed
- [ ] Upload file again
- [ ] Select print specifications
- [ ] Enter pincode for delivery check
- [ ] Click "Check" button
- [ ] Verify delivery availability message
- [ ] Select delivery option
- [ ] Select payment method (COD for testing)
- [ ] Verify price calculation
- [ ] Click "Place Order"
- [ ] Verify order created successfully
- [ ] Check email for confirmation

#### Test 4: Order Tracking
- [ ] Click on order from home page
- [ ] Verify order details displayed
- [ ] Verify status timeline shows
- [ ] Verify payment summary correct

#### Test 5: Order History
- [ ] Click "Order History"
- [ ] Verify orders list displayed
- [ ] Test status filters
- [ ] Click on an order
- [ ] Verify details page opens

#### Test 6: Profile Management
- [ ] Click "Profile"
- [ ] Verify user info displayed
- [ ] Click "Add Address"
- [ ] Fill address form
- [ ] Submit
- [ ] Verify address added
- [ ] Click "Delete" on address
- [ ] Verify address removed

---

### Phase 3: Operator Dashboard Testing

#### Setup: Create Operator User
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

#### Test 1: Operator Login
- [ ] Open http://localhost:3002
- [ ] Login with operator@test.com
- [ ] Verify redirect to print queue

#### Test 2: Print Queue
- [ ] Verify print queue page loads
- [ ] Check if jobs are displayed (if assigned)
- [ ] Click on a job
- [ ] Verify job details page opens

#### Test 3: Job Status Updates
- [ ] Open job detail page
- [ ] Click "Start Printing"
- [ ] Verify status updated
- [ ] Click "Mark Printed"
- [ ] Verify status updated
- [ ] Click "Mark Ready"
- [ ] Verify status updated
- [ ] Check customer email for updates

#### Test 4: Earnings Dashboard
- [ ] Click "Earnings"
- [ ] Verify earnings displayed
- [ ] Test period filters (day/week/month)
- [ ] Verify payout history shows

---

### Phase 4: Delivery Dashboard Testing

#### Setup: Create Delivery User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Delivery",
    "email": "delivery@test.com",
    "phone": "9876543212",
    "password": "password123",
    "role": "delivery"
  }'
```

#### Test 1: Delivery Login
- [ ] Open http://localhost:3003
- [ ] Login with delivery@test.com
- [ ] Verify redirect to active deliveries

#### Test 2: Active Deliveries
- [ ] Verify deliveries page loads
- [ ] Check if deliveries displayed (if assigned)
- [ ] Click on a delivery
- [ ] Verify delivery details page opens

#### Test 3: Delivery Status Updates
- [ ] Click "Mark Picked Up"
- [ ] Verify status updated
- [ ] Click "In Transit"
- [ ] Verify status updated
- [ ] Click "Mark Delivered"
- [ ] Verify status updated
- [ ] Check customer email for updates

---

### Phase 5: Admin Dashboard Testing

#### Setup: Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@printvik.com",
    "phone": "9876543213",
    "password": "admin123",
    "role": "admin"
  }'
```

#### Test 1: Admin Login
- [ ] Open http://localhost:3001
- [ ] Login with admin@printvik.com
- [ ] Verify redirect to dashboard

#### Test 2: Dashboard Overview
- [ ] Verify dashboard loads
- [ ] Check quick links work
- [ ] Navigate to different sections

#### Test 3: Orders Management
- [ ] Click "Orders"
- [ ] Verify all orders displayed
- [ ] Click on an order
- [ ] Verify order details shown

#### Test 4: Users Management
- [ ] Click "Users"
- [ ] Verify users list displayed
- [ ] Test role filters
- [ ] Verify filtering works

#### Test 5: Analytics
- [ ] Click "Analytics"
- [ ] Verify stats displayed
- [ ] Test period filters
- [ ] Verify data updates

---

### Phase 6: Email Notifications Testing

#### Test 1: Order Confirmation Email
- [ ] Create new order as customer
- [ ] Check email inbox
- [ ] Verify order confirmation received
- [ ] Check email content and formatting

#### Test 2: Status Update Email
- [ ] Update order status as operator
- [ ] Check customer email
- [ ] Verify status update email received
- [ ] Check email content

---

### Phase 8: Advanced Admin API Testing

#### Test 1: Dashboard Stats
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:5000/api/admin/stats/dashboard
```
**Expected:** JSON with `totalOrders`, `activeOrders`, `totalRevenue`, etc.

#### Test 2: Audit Logs
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:5000/api/admin/logs
```
**Expected:** Array of log entries with `action`, `details`, `performedBy`.

#### Test 3: Reassign Order
```bash
curl -X POST http://localhost:5000/api/admin/orders/<ORDER_ID>/reassign \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"newOperatorId": "<OP_ID>", "reason": "Overload"}'
```
**Expected:** Success message and log entry created.

#### Test 4: Refund Order
```bash
curl -X POST http://localhost:5000/api/admin/orders/<ORDER_ID>/refund \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "reason": "Poor quality"}'
```
**Expected:** User wallet balance updated.

#### Test 5: Pricing Config
```bash
curl -X PUT http://localhost:5000/api/admin/config/pricing \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"platformCommissionPercent": 15}'
```
**Expected:** Config updated.

#### Test 6: Rider Broadcast
```bash
curl -X POST http://localhost:5000/api/admin/riders/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Rain Alert", "body": "Drive carefully"}'
```
**Expected:** Success message.

---

### Phase 9: Integration Testing

#### Test 1: Complete Order Flow
- [ ] Customer creates order
- [ ] Admin assigns to operator
- [ ] Operator updates status to "printing"
- [ ] Operator marks as "printed"
- [ ] Admin assigns to delivery
- [ ] Delivery partner picks up
- [ ] Delivery partner marks "in-transit"
- [ ] Delivery partner marks "delivered"
- [ ] Verify all emails sent
- [ ] Verify all status updates work

#### Test 2: COD Flow
- [ ] Create order with COD
- [ ] Complete delivery
- [ ] Verify COD amount tracked
- [ ] Check operator earnings
- [ ] Verify payout calculation

---

## 🐛 KNOWN ISSUES TO CHECK

- [ ] File upload size limits working
- [ ] Image/PDF preview working correctly
- [ ] Email service configured properly
- [ ] Razorpay keys configured (if testing payments)
- [ ] Delivery zone data exists in database
- [ ] All routes protected properly
- [ ] Role-based access working
- [ ] Error handling working
- [ ] Loading states showing

---

## 📊 TEST RESULTS

### Backend API
- [ ] Health check: PASS/FAIL
- [ ] Registration: PASS/FAIL
- [ ] Login: PASS/FAIL
- [ ] Order creation: PASS/FAIL
- [ ] Delivery zone check: PASS/FAIL

### Client App
- [ ] Registration: PASS/FAIL
- [ ] Login: PASS/FAIL
- [ ] Order creation: PASS/FAIL
- [ ] Document preview: PASS/FAIL
- [ ] Order tracking: PASS/FAIL
- [ ] Profile management: PASS/FAIL

### Operator Dashboard
- [ ] Login: PASS/FAIL
- [ ] Print queue: PASS/FAIL
- [ ] Status updates: PASS/FAIL
- [ ] Earnings: PASS/FAIL

### Delivery Dashboard
- [ ] Login: PASS/FAIL
- [ ] Active deliveries: PASS/FAIL
- [ ] Status updates: PASS/FAIL

### Admin Dashboard
- [ ] Login: PASS/FAIL
- [ ] Orders view: PASS/FAIL
- [ ] Users management: PASS/FAIL
- [ ] Analytics: PASS/FAIL

### Email Notifications
- [ ] Order confirmation: PASS/FAIL
- [ ] Status updates: PASS/FAIL

---

## 🚀 NEXT STEPS AFTER TESTING

1. Fix any bugs found
2. Optimize performance
3. Add missing features
4. Prepare for deployment
5. Create production environment
6. Deploy to cloud

---

**Testing Status:** IN PROGRESS
**Last Updated:** Now
