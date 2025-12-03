// Demo Orders for Delivery Management Testing
// User ID: 692341a54b445d484a787328 (Rahul Sharma)

const demoOrders = [
    // Order 1: Printed order ready for delivery (Mumbai)
    {
        "orderNumber": "ORD1732445400001",
        "userId": ObjectId("692341a54b445d484a787328"),
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
    },

    // Order 2: Another printed order for delivery (Delhi)
    {
        "orderNumber": "ORD1732445400002",
        "userId": ObjectId("692341a54b445d484a787328"),
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
            "name": "Rahul Sharma",
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
    },

    // Order 3: Self-pickup order (should NOT appear in delivery management)
    {
        "orderNumber": "ORD1732445400003",
        "userId": ObjectId("692341a54b445d484a787328"),
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
];

db.orders.insertMany(demoOrders);
