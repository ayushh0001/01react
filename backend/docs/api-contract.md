Base URL :- "http://localhost:5000/

▣ Users:
    • User Object (Basic - from Users collection)
        {
        "id": "user_123",
        "name": "Rahul Sharma",
        "mobile": "9876543210",
        "username": "abx122",
        "email": "rahul@example.com",
        "role": "customer",
        "isVerified": false,
        "profileImage": "https://cloudinary.com/image_url",
        "TimeStamp": "2025-11-29T10:00:00Z"
        }

    • Complete User Profile (Aggregated from all collections)
        {
        "user": {<user_object>},
        "details": {<user_details_object>},
        "sellerDetails": {<seller_details_object>}, // if seller
        "bankDetails": {<bank_details_object>} // if seller
        }

1. GET :- /users
--------------------------------------------------------------------------------------
Returns all users in the system.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
    users: [
            {<user_object>},
            {<user_object>},
            {<user_object>}
            ]
    }



2. GET  :-  /users/:id
--------------------------------------------------------------------------------------
Returns the specified user.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { <user_object> }
• Error Response:
    • Code: 404
    • Content: { error : "User doesn't exist" }
    OR
    • Code: 401
    • Content: { error : error : "You are unauthorized to make this request." }



3. GET  :- /users/:id/orders
--------------------------------------------------------------------------------------
Returns all Orders associated with the specified user.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content:
        {
        orders:
            [
                {<order_object>},
                {<order_object>},
                {<order_object>}
            ]
        }
• Error Response:
    • Code: 404
    • Content: { error : "User doesn't exist" }
    OR
    • Code: 401
    • Content: { error : error : "You are unauthorized to make this request." }


4. POST  :- /users/signup
--------------------------------------------------------------------------------------
Creates a new User and returns the new object.
• URL Params
    None
• Data Params
    {
        name: string,
        mobile: string,
        role: string,
        password: string,
        username: string,
        email: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { <user_object> }


5. POST  :- /users/sendOTP
--------------------------------------------------------------------------------------
Sends an OTP to the user's registered mobile number for verification.
• URL Params
    None
• Data Params
    {
        mobile: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { message : "OTP sent successfully" }
• Error Response:
    • Code: 500
    • Content: { error : "Internal Server Error" }



6. POST  :- /users/login
--------------------------------------------------------------------------------------
Authenticates a user and returns an OAuth token.
• URL Params
    None
• Data Params
    {
        username/email: string,
        password: string
    }

• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { <user_object> }
• Error Response:
    • Code: 401
    • Content: { error : "Invalid credentials" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }


7. POST  :- /users/forgetpassword
--------------------------------------------------------------------------------------
Sends a password reset link to the user's registered email.
• URL Params
    None
• Data Params
    {
        email: string,
        mobile: string,
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { message : "Password reset link sent successfully" }
• Error Response:
    • Code: 404
    • Content: { error : "User with given email/mobile doesn't exist" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }



8. PATCH  :- /users/:id
--------------------------------------------------------------------------------------
Updates fields on the specified user and returns the updated object.
• URL Params
    Required: id=[string]
• Data Params
    {
        username: string, // or whatever user want to update
        email: string
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { <user_object> }
• Error Response:
    • Code: 404
    • Content: { error : "User doesn't exist" }
    OR
    • Code: 401
    • Content: { error : error : "You are unauthorized to make this request." }


9. POST  :- /users/logout
--------------------------------------------------------------------------------------
Logs out the authenticated user and invalidates their session/token.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Logged out successfully" }
• Error Response:
    • Code: 401
    • Content: { error : "You are unauthorized to make this request." }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }


10. POST  :- /users/verify-pan
--------------------------------------------------------------------------------------
Verifies PAN number for seller registration using InstantPay API.
• URL Params
    None
• Data Params
    {
        pan: string,
        name: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: {
        verified: true,
        pan: "ABCDE1234F",
        name: "John Doe",
        message: "PAN verified successfully"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid PAN format" }
    OR
    • Code: 422
    • Content: { error : "PAN verification failed" }
    OR
    • Code: 500
    • Content: { error : "Verification service unavailable" }


11. POST  :- /users/verify-gst
--------------------------------------------------------------------------------------
Verifies GST number for seller registration using InstantPay API.
• URL Params
    None
• Data Params
    {
        gst: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: {
        verified: true,
        gst: "22AAAAA0000A1Z5",
        businessName: "ABC Company Pvt Ltd",
        status: "Active",
        message: "GST verified successfully"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid GST format" }
    OR
    • Code: 422
    • Content: { error : "GST verification failed" }
    OR
    • Code: 500
    • Content: { error : "Verification service unavailable" }


12. POST  :- /users/profile-details
--------------------------------------------------------------------------------------
Adds user details (address, profile info) for both customers and sellers.
• URL Params
    None
• Data Params
    {
        dateOfBirth: string,
        address: string,
        city: string,
        state: string,
        pincode: string,
        gender: string
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message: "User details added successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid user details" }
    OR
    • Code: 401
    • Content: { error : "Unauthorized" }


13. POST  :- /users/seller-details
--------------------------------------------------------------------------------------
Adds seller business details after PAN/GST verification.
• URL Params
    None
• Data Params
    {
        pan: string,
        gst: string,
        businessName: string,
        businessDescription: string,
        businessType: string
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message: "Seller details added successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid seller details" }
    OR
    • Code: 401
    • Content: { error : "Unauthorized" }


14. POST  :- /users/bank-details
--------------------------------------------------------------------------------------
Adds seller bank details for payments.
• URL Params
    None
• Data Params
    {
        accountNumber: string,
        ifscCode: string,
        bankName: string,
        accountHolderName: string,
        accountType: string
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message: "Bank details added successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid bank details" }
    OR
    • Code: 401
    • Content: { error : "Unauthorized" }



15. POST  :- /users/verify-bank-account
--------------------------------------------------------------------------------------
Verifies bank account using penny drop method.
• URL Params
    None
• Data Params
    {
        accountNumber: string,
        ifscCode: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: {
        verified: true,
        accountHolderName: "John Doe",
        message: "Bank account verified"
    }
• Error Response:
    • Code: 422
    • Content: { error : "Bank verification failed" }


16. POST  :- /users/refresh-token
--------------------------------------------------------------------------------------
Refreshes expired JWT tokens.
• URL Params
    None
• Data Params
    {
        refreshToken: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: {
        accessToken: "new_jwt_token",
        refreshToken: "new_refresh_token"
    }
• Error Response:
    • Code: 401
    • Content: { error : "Invalid refresh token" }


17. POST  :- /upload/image
--------------------------------------------------------------------------------------
Uploads images to Cloudinary for profiles, products, etc.
• URL Params
    None
• Data Params (multipart/form-data)
    {
        image: file,
        type: string, // "profile" | "product" | "category"
        folder?: string // optional cloudinary folder
    }
• Headers
    Content-Type: multipart/form-data
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sample.jpg",
        publicId: "sample_id",
        message: "Image uploaded successfully"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid image format" }
    OR
    • Code: 413
    • Content: { error : "File size too large" }
    OR
    • Code: 500
    • Content: { error : "Upload failed" }


▣ Products:
    • Product Object
        {
        "Product_Id": "product_123",
        "seller_id": "user_456",
        "Product_Name": "Wireless Headphones",
        "Product_Description": "High-quality wireless headphones with noise cancellation",
        "Category_Id": "category_789",
        "Deepest_CategoryName": "SweatShirt",
        "CategoryPath": "fashion-man-shirt-casual-solid"
        "Instock": "yes",
        "Product_Image": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
        "TimeStamp": "day/date/month/year/time"
        }

    • Category Object
        {
        "id": "category_123",
        "name": "Electronics",
        "parentId": null, // for subcategories
        "Slug": "url_format"
        "createdAt": "2025-11-29T10:00:00Z"
        }

    • Inventory Object
        {
        "id": "123",
        "seller_id: "user_546",
        "Product_Id: "product_4564",
        "Quantity": "200pcs",
        "createdAt": "2025-11-29T10:00:00Z"
        }
    • Review Object
        {
        "id": "reviews_123",
        "User_ID": "user_456",
        "Product_ID": "product_989",
        "Comments": "Premium electronics brand",
        "Rating": 6,
        "images": ["https://cloudinary.com/review1.jpg"],
        "createdAt": "2025-11-29T10:00:00Z"
        }

18. GET :- /products
--------------------------------------------------------------------------------------
Returns all products with  filters.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "products": [{<product_object>}],
    }

19. GET :- /products/:id
--------------------------------------------------------------------------------------
Returns the specified product with full details.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { <product_object> }
• Error Response:
    • Code: 404
    • Content: { error : "Product not found" }

20. POST :- /products
--------------------------------------------------------------------------------------
Creates a new product (seller only).
• URL Params
    None
• Data Params
    {
        "Product_Name": "string",
        "description": "string",
        "categoryId": "string",
        "deepestCategoryName": "string",
        "categoryPath": [{"}]
        "price": "number",
        "Product_Quantity": "number",
        "images": ["string"],
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: { <product_object> }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid product data" }
    OR
    • Code: 401
    • Content: { error : "Unauthorized - Seller access required" }

21. PUT :- /products/:id
--------------------------------------------------------------------------------------
Updates the specified product (seller only - own products).
• URL Params
    Required: id=[string]
• Data Params
    {
        "Product_Name": "string",
        "description": "string",
        "categoryId": "string",
        "deepestCategoryName": "string",
        "categoryPath": [{"}]
        "price": "number",
        "Product_Quantity": "number",
        "images": ["string"],
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { <product_object> }
• Error Response:
    • Code: 404
    • Content: { error : "Product not found" }
    OR
    • Code: 403
    • Content: { error : "Access denied - Not your product" }

22. DELETE :- /products/:id
--------------------------------------------------------------------------------------
Deletes the specified product (seller only - own products).
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product deleted successfully" }
• Error Response:
    • Code: 404
    • Content: { error : "Product not found" }
    OR
    • Code: 403
    • Content: { error : "Access denied - Not your product" }

23. GET :- /products/:sellerId
--------------------------------------------------------------------------------------
Returns all products for a specific seller.
• URL Params
    Required: sellerId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "products": [{<product_object>}],
        "pagination": {<pagination_object>}
    }

24. GET :- /products/category/:categoryId
--------------------------------------------------------------------------------------
Returns all products in a specific category.
• URL Params
    Required: categoryId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "products": [{<product_object>}],
    }

25. POST :- /products/:id/approve
--------------------------------------------------------------------------------------
Approves a product (admin only).
• URL Params
    Required: id=[string]
• Data Params
    {
        "approved": "boolean",
        "reason": "string" // if rejected
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product approval status updated" }
• Error Response:
    • Code: 401
    • Content: { error : "Admin access required" }


▣ Categories:

26. GET :- /categories
--------------------------------------------------------------------------------------
Returns all categories and subcategories.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "categories": [{<category_object>}]
    }


▣ Product Reviews:

31. GET :- /products/:id/reviews
--------------------------------------------------------------------------------------
Returns all reviews for a product.
• URL Params
    Required: id=[string]
    Optional: page=[number], limit=[number]
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "reviews":[
            {
                "id": "review_123",
                "userId": "user_456",
                "product_ID": "Earphone",
                "rating": 5,
                "comment": "Excellent product!",
                "images": ["https://cloudinary.com/review1.jpg"],
                "timestamp": "2025-11-29T10:00:00Z"
            }
        ]

    }

32. POST :- /products/:id/reviews
--------------------------------------------------------------------------------------
Adds a review for a product (authenticated users only).
• URL Params
    Required: id=[string]
• Data Params
    {
        "rating": "number", // 1-5
        "comment": "string",
        "images": ["string"] // optional
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: { message : "Review added successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "You can only review purchased products" }




▣ Wishlist:

33. GET :- /users/:id/wishlist
--------------------------------------------------------------------------------------
Returns user's wishlist.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content:
    {
        "wishlist": [{<product_object>}]
    }

34. POST :- /users/:id/wishlist
--------------------------------------------------------------------------------------
Adds product to wishlist.
• URL Params
    Required: id=[string]
• Data Params
    {
        "productId": "string"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product added to wishlist" }

35. DELETE :- /users/:id/wishlist/:productId
--------------------------------------------------------------------------------------
Removes product from wishlist.
• URL Params
    Required: id=[string], productId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product removed from wishlist" }



▣ Cart:

36. GET :- /users/:id/cart
--------------------------------------------------------------------------------------
Returns user's cart items.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content:
    {
        "cart": [
            {
                "id": "cartitem_123",
                "productId": "product_123",
                "product": {<product_object>},
                "quantity": 2,
                "priceAtAdd": 2999.99,
                "currentPrice": 3199.99,
                "isAvailable": true,
                "priceChanged": true,
                "addedAt": "2025-11-29T10:00:00Z"
            }
        ],
        "totalItems": 3,
        "totalAmount": 7499.97,
        "hasUnavailableItems": false,
        "hasPriceChanges": true
    }

37. POST :- /users/:id/cart
--------------------------------------------------------------------------------------
Adds product to cart.
• URL Params
    Required: id=[string]
• Data Params
    {
        "productId": "string",
        "quantity":  "number",
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product added to cart" }


38. PUT :- /users/:id/cart/:productId
--------------------------------------------------------------------------------------
Updates quantity of product in cart.
• URL Params
    Required: id=[string], productId=[string]
• Data Params
    {
        "quantity": "number"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Cart updated successfully" }


39. DELETE :- /users/:id/cart/:productId
--------------------------------------------------------------------------------------
Removes product from cart.
• URL Params
    Required: id=[string], productId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product removed from cart" }


40. DELETE :- /users/:id/cart
--------------------------------------------------------------------------------------
Clears entire cart.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Cart cleared successfully" }



▣ Orders:

    • Order Object
        {
        "id": "order_123",
        "userId": "user_456",
        "orderNumber": "ORD-2025-001234",
        "status": "pending", // pending, confirmed, processing, shipped, delivered, cancelled, returned
        "paymentStatus": "paid", // pending, paid, failed, refunded
        "totalAmount": 7499.97,
        "shippingAmount": 99.00,
        "taxAmount": 674.99,
        "finalAmount": 7273.96,
        "shippingAddress": {
            "name": "John Doe",
            "phone": "9876543210",
            "address": "123 Main St",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "landmark": "Near Metro Station"
        },
        "billingAddress": {<same_structure_as_shipping>},
        "paymentMethod": "razorpay", // razorpay, cod, wallet
        "paymentId": "pay_razorpay_123",
        "estimatedDelivery": "2025-12-05T18:00:00Z",
        "actualDelivery": null,
        "trackingNumber": "TRK123456789",
        "notes": "Handle with care",
        "createdAt": "2025-11-29T10:00:00Z",
        "updatedAt": "2025-11-29T10:00:00Z"
        }

▣ Payments:

    • Payment Object
        {
        "id": "payment_123",
        "orderId": "order_456",
        "userId": "user_789",
        "amount": 7273.96,
        "currency": "INR",
        "method": "razorpay", // razorpay, cod, wallet
        "status": "pending", // pending, processing, completed, failed, cancelled, refunded
        "gatewayPaymentId": "pay_razorpay_123",
        "gatewayOrderId": "order_razorpay_456",
        "gatewaySignature": "signature_hash",
        "failureReason": null,
        "refundAmount": 0,
        "refundStatus": null, // pending, completed, failed
        "createdAt": "2025-11-29T10:00:00Z",
        "updatedAt": "2025-11-29T10:00:00Z"
        }

48. POST :- /payments/create
--------------------------------------------------------------------------------------
Creates payment intent for order.
• URL Params
    None
• Data Params
    {
        "orderId": "order_123",
        "amount": 7273.96,
        "currency": "INR",
        "method": "razorpay" // razorpay, cod, wallet
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: {
        "payment": {<payment_object>},
        "gatewayData": {
            "key": "rzp_test_key",
            "orderId": "order_razorpay_456",
            "amount": 727396, // amount in paise
            "currency": "INR",
            "name": "Zpin Store",
            "description": "Payment for Order #ORD-2025-001234"
        }
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid order or amount" }

49. POST :- /payments/verify
--------------------------------------------------------------------------------------
Verifies payment after gateway response.
• URL Params
    None
• Data Params
    {
        "paymentId": "payment_123",
        "gatewayPaymentId": "pay_razorpay_123",
        "gatewayOrderId": "order_razorpay_456",
        "gatewaySignature": "signature_hash"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "payment": {<payment_object>},
        "order": {<order_object>},
        "verified": true
    }
• Error Response:
    • Code: 400
    • Content: { error : "Payment verification failed" }

50. GET :- /payments/:id
--------------------------------------------------------------------------------------
Returns payment details.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "payment": {<payment_object>},
        "order": {<order_object>}
    }
• Error Response:
    • Code: 404
    • Content: { error : "Payment not found" }

51. POST :- /payments/:id/refund
--------------------------------------------------------------------------------------
Processes payment refund.
• URL Params
    Required: id=[string]
• Data Params
    {
        "amount": 2000.00, // optional, defaults to full amount
        "reason": "Order cancelled by customer"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "refund": {
            "id": "refund_123",
            "paymentId": "payment_456",
            "amount": 2000.00,
            "status": "processing",
            "gatewayRefundId": "rfnd_razorpay_789",
            "reason": "Order cancelled by customer",
            "createdAt": "2025-11-29T15:00:00Z"
        }
    }
• Error Response:
    • Code: 400
    • Content: { error : "Refund not allowed for this payment" }

52. GET :- /orders/:id/payments
--------------------------------------------------------------------------------------
Returns payment history for an order.
• URL Params
    Required: id=[string] // order ID
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "payments": [{<payment_object>}],
        "refunds": [
            {
                "id": "refund_123",
                "amount": 1000.00,
                "status": "completed",
                "reason": "Partial refund",
                "createdAt": "2025-11-29T16:00:00Z"
            }
        ]
    }

53. POST :- /payments/razorpay/webhook
--------------------------------------------------------------------------------------
Handles Razorpay webhook notifications.
• URL Params
    None
• Data Params
    Razorpay webhook payload
• Headers
    Content-Type: application/json
    X-Razorpay-Signature: <webhook_signature>
• Success Response:
    • Code: 200
    • Content: { message: "Webhook processed successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid webhook signature" }

54. POST :- /payments/cod/confirm
--------------------------------------------------------------------------------------
Confirms Cash on Delivery payment.
• URL Params
    None
• Data Params
    {
        "orderId": "order_123",
        "collectedAmount": 7273.96,
        "deliveryPersonId": "delivery_456"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "payment": {<payment_object>},
        "order": {<order_object>}
    }

    • OrderItem Object
        {
        "id": "orderitem_123",
        "orderId": "order_456",
        "productId": "product_789",
        "sellerId": "seller_101",
        "productName": "Wireless Headphones",
        "productImage": "https://cloudinary.com/image.jpg",
        "quantity": 2,
        "unitPrice": 2499.99,
        "totalPrice": 4999.98,
        "status": "confirmed", // confirmed, processing, shipped, delivered, cancelled, returned
        "trackingNumber": "TRK123456789"
        }

41. POST :- /orders
--------------------------------------------------------------------------------------
Creates a new order from cart items.
• URL Params
    None
• Data Params
    {
        "cartItems": ["cartitem_123", "cartitem_456"], // array of cart item IDs
        "shippingAddressId": "address_789", // or full address object
        "paymentMethod": "razorpay", // razorpay, cod
        "notes": "Handle with care", // optional
        "couponCode": "SAVE20" // optional
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: {
        "order": {<order_object>},
        "orderItems": [{<orderitem_object>}],
        "paymentDetails": {
            "paymentId": "pay_razorpay_123",
            "amount": 7273.96,
            "currency": "INR",
            "status": "created"
        }
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid cart items or insufficient stock" }

42. GET :- /orders
--------------------------------------------------------------------------------------
Returns user's orders with pagination.
• URL Params
    Optional:
    - page=[number] (default: 1)
    - limit=[number] (default: 10)
    - status=[string] (pending, confirmed, delivered, etc.)
    - dateFrom=[string] (YYYY-MM-DD)
    - dateTo=[string] (YYYY-MM-DD)
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content:
    {
        "orders": [{<order_object>}],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalOrders": 48,
            "hasNext": true,
            "hasPrev": false
        }
    }

43. GET :- /orders/:id
--------------------------------------------------------------------------------------
Returns specific order with full details.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "order": {<order_object>},
        "orderItems": [{<orderitem_object>}],
        "statusHistory": [
            {
                "status": "confirmed",
                "timestamp": "2025-11-29T10:00:00Z",
                "note": "Order confirmed by seller"
            }
        ]
    }
• Error Response:
    • Code: 404
    • Content: { error : "Order not found" }
    OR
    • Code: 403
    • Content: { error : "Access denied" }

44. PUT :- /orders/:id/cancel
--------------------------------------------------------------------------------------
Cancels an order (customer only - if cancellable).
• URL Params
    Required: id=[string]
• Data Params
    {
        "reason": "Changed mind", // cancellation reason
        "refundMethod": "original" // original, wallet
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        message : "Order cancelled successfully",
        "refundAmount": 7273.96,
        "refundStatus": "processing"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Order cannot be cancelled at this stage" }

45. GET :- /orders/:id/track
--------------------------------------------------------------------------------------
Returns order tracking information.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "trackingNumber": "TRK123456789",
        "currentStatus": "shipped",
        "estimatedDelivery": "2025-12-05T18:00:00Z",
        "trackingHistory": [
            {
                "status": "Order Confirmed",
                "location": "Mumbai Warehouse",
                "timestamp": "2025-11-29T10:00:00Z"
            },
            {
                "status": "Shipped",
                "location": "Mumbai Hub",
                "timestamp": "2025-11-30T14:30:00Z"
            }
        ]
    }

▣ Seller Order Management:

46. GET :- /sellers/:sellerId/orders
--------------------------------------------------------------------------------------
Returns orders for seller's products.
• URL Params
    Required: sellerId=[string]
    Optional:
    - page=[number]
    - status=[string]
    - dateFrom=[string]
    - dateTo=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content:
    {
        "orders": [
            {
                "orderId": "order_123",
                "orderNumber": "ORD-2025-001234",
                "customerName": "John Doe",
                "orderItems": [{<orderitem_object>}], // only seller's items
                "totalAmount": 4999.98,
                "status": "pending",
                "createdAt": "2025-11-29T10:00:00Z"
            }
        ],
        "pagination": {<pagination_object>}
    }

47. PUT :- /sellers/:sellerId/orders/:id/status
--------------------------------------------------------------------------------------
Updates order status (seller only).
• URL Params
    Required: sellerId=[string], id=[string] // order ID
• Data Params
    {
        "status": "confirmed", // confirmed, processing, shipped
        "trackingNumber": "TRK123456789", // required for shipped status
        "estimatedDelivery": "2025-12-05T18:00:00Z" // required for shipped status
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        message : "Order status updated successfully",
        "order": {<order_object>}
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid status transition" }
    OR
    • Code: 403
    • Content: { error : "Not authorized to update this order" }": "2025-12-05T18:00:00Z", // optional
        "note": "Order processed and ready for shipping"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Order status updated successfully" }
• Error Response:
    • Code: 403
    • Content: { error : "Not authorized to update this order" }


▣ Payment Integration:

48. POST :- /orders/:id/payment/verify
--------------------------------------------------------------------------------------
Verifies payment after successful payment gateway response.
• URL Params
    Required: id=[string]
• Data Params
    {
        "paymentId": "pay_razorpay_123",
        "signature": "signature_from_razorpay",
        "orderId": "order_razorpay_456"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        message : "Payment verified successfully",
        "paymentStatus": "paid",
        "order": {<order_object>}
    }
• Error Response:
    • Code: 400
    • Content: { error : "Payment verification failed" }

49. POST :- /orders/:id/payment/retry
--------------------------------------------------------------------------------------
Retries payment for failed orders.
• URL Params
    Required: id=[string]
• Data Params
    {
        "paymentMethod": "razorpay"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "paymentDetails": {
            "paymentId": "pay_razorpay_new_123",
            "amount": 7273.96,
            "currency": "INR"
        }
    }


▣ Returns & Refunds:

50. POST :- /orders/:id/return
--------------------------------------------------------------------------------------
Initiates return request for delivered orders.
• URL Params
    Required: id=[string]
• Data Params
    {
        "orderItemIds": ["orderitem_123", "orderitem_456"], // items to return
        "reason": "Defective product",
        "description": "Product not working as expected",
        "images": ["https://cloudinary.com/return1.jpg"] // optional
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: {
        "returnId": "return_123",
        "status": "requested",
        "message": "Return request submitted successfully"
    }

51. GET :- /orders/:id/invoice
--------------------------------------------------------------------------------------
Downloads order invoice (PDF).
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: PDF file download
• Error Response:
    • Code: 404
    • Content: { error : "Invoice not found" }