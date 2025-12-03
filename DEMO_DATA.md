# Demo Data for Delivery Management Testing

## Prerequisites
Make sure you have:
1. MongoDB running
2. Backend server running on port 5000
3. At least one delivery boy user created with role='delivery'

## Sample Orders for Delivery Testing

Use MongoDB Compass or mongosh to insert these sample orders into your `orders` collection:

```javascript
// Order 1: Printed order ready for delivery
{
  "orderNumber": "ORD1732445400001",
  "userId": ObjectId("YOUR_USER_ID_HERE"), // Replace with actual user ID
  "documents": [
    {
      "filename": "assignment.pdf",
      "url": "/uploads/sample-doc.pdf",
      "fileType": "application/pdf",
      "uploadedAt": new Date()
    }
  ],
  "specifications": {
    "colorType": "color",
    "paperSize": "A4",
    "copies": 5,
    "pages": 10,
    "binding": "spiral",
    "serviceTypes": []
  },
  "instructions": "Please bind carefully",
  "totalAmount": 250,
  "platformFee": 10,
  "deliveryCharge": 40,
  "paymentMethod": "online",
  "paymentStatus": "completed",
  "orderStatus": "printed",
  "deliveryOption": "delivery",
  "deliveryAddress": {
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "addressLine1": "123 MG Road",
    "addressLine2": "Near City Mall",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "location": {
      "lat": 19.0760,
      "lng": 72.8777
    }
  },
  "deliveryStatus": "pending",
  "createdAt": new Date(),
  "updatedAt": new Date()
}

// Order 2: Another printed order for delivery
{
  "orderNumber": "ORD1732445400002",
  "userId": ObjectId("YOUR_USER_ID_HERE"),
  "documents": [
    {
      "filename": "project-report.pdf",
      "url": "/uploads/sample-doc2.pdf",
      "fileType": "application/pdf",
      "uploadedAt": new Date()
    }
  ],
  "specifications": {
    "colorType": "bw",
    "paperSize": "A4",
    "copies": 3,
    "pages": 25,
    "binding": "staple",
    "serviceTypes": []
  },
  "instructions": "Urgent delivery needed",
  "totalAmount": 180,
  "platformFee": 10,
  "deliveryCharge": 40,
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "orderStatus": "printed",
  "deliveryOption": "delivery",
  "deliveryAddress": {
    "name": "Priya Patel",
    "phone": "9123456789",
    "addressLine1": "456 Park Street",
    "addressLine2": "Opposite Metro Station",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "location": {
      "lat": 28.7041,
      "lng": 77.1025
    }
  },
  "deliveryStatus": "pending",
  "createdAt": new Date(),
  "updatedAt": new Date()
}

// Order 3: Self-pickup order (should NOT appear in delivery management)
{
  "orderNumber": "ORD1732445400003",
  "userId": ObjectId("YOUR_USER_ID_HERE"),
  "documents": [
    {
      "filename": "notes.pdf",
      "url": "/uploads/sample-doc3.pdf",
      "fileType": "application/pdf",
      "uploadedAt": new Date()
    }
  ],
  "specifications": {
    "colorType": "color",
    "paperSize": "A4",
    "copies": 2,
    "pages": 5,
    "binding": "none",
    "serviceTypes": []
  },
  "instructions": "Will pick up myself",
  "totalAmount": 100,
  "platformFee": 5,
  "deliveryCharge": 0,
  "paymentMethod": "online",
  "paymentStatus": "completed",
  "orderStatus": "printed",
  "deliveryOption": "pickup",
  "deliveryStatus": "pending",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

## How to Insert Demo Data

### Method 1: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `printvik` database → `orders` collection
4. Click "ADD DATA" → "Insert Document"
5. Copy-paste each order JSON (replace `YOUR_USER_ID_HERE` with actual user ID)
6. Click "Insert"

### Method 2: Using mongosh
```bash
mongosh

use printvik

# Get a user ID first
db.users.findOne({role: 'user'}, {_id: 1})

# Insert orders (replace YOUR_USER_ID_HERE with the ID from above)
db.orders.insertMany([
  // Paste the order objects here
])
```

## Expected Results

After inserting this data:

1. **Delivery Management → Pending Assignment**: Should show 2 orders
   - ORD1732445400001 (Mumbai delivery)
   - ORD1732445400002 (Delhi delivery)

2. **Delivery Management → Pending Assignment**: Should NOT show
   - ORD1732445400003 (Self-pickup order)

3. **Orders Page**: Should show all 3 orders with proper status badges

## Testing Workflow

1. Go to **Delivery Management** page
2. Click **Pending Assignment** tab
3. You should see 2 orders ready for delivery
4. Select a delivery boy from dropdown
5. Click **Assign** button
6. Order should move to **Assigned** tab
7. Verify the order no longer appears in **Pending Assignment**

## Creating a Delivery Boy User

If you don't have a delivery boy user, create one:

```javascript
// Using mongosh or Compass
db.users.insertOne({
  "name": "Amit Kumar",
  "email": "delivery@printvik.com",
  "password": "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "password123"
  "phone": "9999888877",
  "role": "delivery",
  "isApproved": true,
  "isActive": true,
  "vehicleType": "bike",
  "vehicleNumber": "MH01AB1234",
  "createdAt": new Date(),
  "updatedAt": new Date()
})
```

Or use the signup API with role='delivery' and then approve from admin panel.
