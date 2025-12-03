# Printvik Platform - Debugging Guide

## 🐛 Common Issues & Solutions

### Issue 1: Backend Server Won't Start

**Symptoms:**
- Server crashes on startup
- Port already in use error
- MongoDB connection error

**Solutions:**

#### Problem: Port 5000 Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

#### Problem: MongoDB Not Running
```bash
# Check if MongoDB is installed
mongod --version

# If not installed (Mac):
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

#### Problem: Missing Dependencies
```bash
cd backend
npm install
```

#### Problem: Missing .env File
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

---

### Issue 2: Frontend App Won't Start

**Symptoms:**
- Vite build errors
- Module not found errors
- Blank screen

**Solutions:**

#### Problem: Dependencies Not Installed
```bash
cd client-app  # or operator-dashboard, delivery-dashboard, admin-dashboard
npm install
```

#### Problem: Missing .env File
```bash
# Create .env in each frontend app
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

#### Problem: Port Conflicts
```bash
# Client app uses 5173
# Operator uses 3002
# Delivery uses 3003
# Admin uses 3001

# If port in use, kill process:
lsof -ti:5173 | xargs kill -9
```

---

### Issue 3: API Requests Failing

**Symptoms:**
- CORS errors
- 401 Unauthorized
- Network errors

**Solutions:**

#### Problem: CORS Errors
Check backend `.env` has correct frontend URLs:
```
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:3001
OPERATOR_URL=http://localhost:3002
DELIVERY_URL=http://localhost:3003
```

#### Problem: 401 Unauthorized
- Check if user is logged in
- Check if JWT token is valid
- Check localStorage for token:
```javascript
console.log(localStorage.getItem('token'));
```

#### Problem: API URL Wrong
Check frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

### Issue 4: File Upload Not Working

**Symptoms:**
- Files not uploading
- 413 Payload Too Large
- File type errors

**Solutions:**

#### Problem: File Too Large
Check `MAX_FILE_SIZE` in backend `.env`:
```
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

#### Problem: Unsupported File Type
Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG

Check file extension before upload.

#### Problem: Upload Directory Missing
```bash
cd backend
mkdir -p uploads
```

---

### Issue 5: Email Notifications Not Sending

**Symptoms:**
- No emails received
- Email service errors

**Solutions:**

#### Problem: Email Credentials Not Set
Update backend `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in .env

#### Problem: Email Service Error
Check backend logs for errors:
```bash
# Backend terminal will show email errors
# Emails fail silently - won't break order creation
```

#### Problem: Nodemailer Crash (TypeError: createTransporter is not a function)
**Issue:** The `nodemailer` package might be corrupted or have a version mismatch.
**Workaround:**
1. Comment out email service imports in `backend/routes/orders.js`.
2. Comment out `sendOrderConfirmation` and `sendStatusUpdate` calls.
3. Reinstall package:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```


---

### Issue 6: Payment Integration Issues

**Symptoms:**
- Razorpay not loading
- Payment verification failing

**Solutions:**

#### Problem: Razorpay Keys Not Set
Update backend `.env`:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

#### Problem: Test Mode
For testing, use Razorpay test keys:
- Get test keys from Razorpay dashboard
- Use test card: 4111 1111 1111 1111

---

### Issue 7: Database Issues

**Symptoms:**
- Data not saving
- Validation errors
- Connection timeouts

**Solutions:**

#### Problem: MongoDB Not Connected
Check backend logs for:
```
✅ MongoDB Connected: localhost
```

If not connected:
```bash
# Check MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community
```

#### Problem: Database Connection String Wrong
Check backend `.env`:
```
MONGODB_URI=mongodb://localhost:27017/printvik
```

#### Problem: Validation Errors
Check backend logs for specific validation errors.
Common issues:
- Missing required fields
- Invalid data types
- Duplicate keys

---

### Issue 8: Authentication Issues

**Symptoms:**
- Can't login
- Token expired
- Role access denied

**Solutions:**

#### Problem: Invalid Credentials
- Check email and password are correct
- Password is case-sensitive
- Email must be registered

#### Problem: Token Expired
Tokens expire after 30 days. Login again.

#### Problem: Wrong Role Access
- Customers can't access operator dashboard
- Operators can't access admin dashboard
- Check user role in database

---

### Issue 9: Document Preview Not Working

**Symptoms:**
- Preview modal not opening
- PDF not displaying
- Images not showing

**Solutions:**

#### Problem: File Path Wrong
Check if files are uploaded to `/uploads` directory

#### Problem: CORS for File Access
Ensure backend serves static files:
```javascript
app.use('/uploads', express.static('uploads'));
```

#### Problem: Browser PDF Viewer
Some browsers block PDF iframes. Use Chrome for best compatibility.

---

### Issue 10: Delivery Zone Check Not Working

**Symptoms:**
- "Delivery not available" for all pincodes
- API error

**Solutions:**

#### Problem: No Delivery Zones in Database
Create test delivery zone:
```javascript
// In MongoDB or via admin API
{
  name: "Test Zone",
  type: "pincode",
  pincodes: ["110001", "110002", "110003"],
  deliveryAvailable: true,
  deliveryCharge: 30,
  estimatedDeliveryTime: "2-3 days",
  isActive: true
}
```

#### Problem: API Route Not Added
Check `server.js` has:
```javascript
app.use('/api/delivery-zones', require('./routes/deliveryZones'));
```

---

## 🔍 Debugging Tools

### 1. Check Backend Logs
```bash
cd backend
npm run dev
# Watch terminal for errors
```

### 2. Check Frontend Console
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
# Check Network tab for API calls
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890","password":"test123"}'
```

### 4. Check Database
```bash
# Connect to MongoDB
mongosh

# Use database
use printvik

# Check collections
show collections

# View users
db.users.find()

# View orders
db.orders.find()
```

### 5. Clear Browser Cache
```bash
# Sometimes helps with frontend issues
# Chrome: Ctrl+Shift+Delete
# Clear cache and cookies
```

---

## 🚀 Quick Debug Checklist

### Backend:
- [ ] MongoDB is running
- [ ] Backend server started successfully
- [ ] .env file exists with all variables
- [ ] Dependencies installed (node_modules exists)
- [ ] No port conflicts
- [ ] CORS configured correctly

### Frontend:
- [ ] Dependencies installed
- [ ] .env file exists with API_URL
- [ ] No port conflicts
- [ ] Browser console has no errors
- [ ] API calls reaching backend

### Database:
- [ ] MongoDB connected
- [ ] Collections created
- [ ] Test data exists (if needed)
- [ ] Indexes created

### Integration:
- [ ] Backend and frontend URLs match
- [ ] CORS allows frontend origin
- [ ] JWT tokens working
- [ ] File uploads working
- [ ] Emails sending (if configured)

---

## 📝 Debug Log Template

When reporting issues, provide:

```
**Issue:** Brief description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Error Messages:**
Copy exact error from console/terminal

**Environment:**
- OS: macOS/Windows/Linux
- Node version: 
- MongoDB version:
- Browser: Chrome/Firefox/Safari

**Screenshots:**
Attach if relevant
```

---

## 🆘 Emergency Fixes

### Nuclear Option 1: Fresh Start
```bash
# Stop all servers
# Delete node_modules
cd backend && rm -rf node_modules && npm install
cd ../client-app && rm -rf node_modules && npm install
cd ../operator-dashboard && rm -rf node_modules && npm install
cd ../delivery-dashboard && rm -rf node_modules && npm install
cd ../admin-dashboard && rm -rf node_modules && npm install
```

### Nuclear Option 2: Reset Database
```bash
# WARNING: Deletes all data
mongosh
use printvik
db.dropDatabase()
```

### Nuclear Option 3: Kill All Processes
```bash
# Kill all node processes
killall node

# Kill specific ports
lsof -ti:5000,5173,3001,3002,3003 | xargs kill -9
```

---

## 📞 Getting Help

1. Check error messages carefully
2. Search error on Google/Stack Overflow
3. Check documentation files:
   - README.md
   - TESTING.md
   - QUICKSTART.md
4. Review code comments
5. Check GitHub issues (if open source)

---

**Last Updated:** Now  
**Status:** Ready for debugging
