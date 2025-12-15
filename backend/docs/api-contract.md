*****always keep in mind that while desinging the api contract think that what data/field the client need for the UI if that feild is not into that particular entity or it is in related entity but you just add those field in the object*****

Base URL :- "http://localhost:5000/

▣ Users:
    • User Object (Basic - aggregated for client convenience)
        {
        "id": "user_123",                    // From Users entity
        "name": "Rahul Sharma",               // From Users entity
        "mobile": "9876543210",               // From Users entity
        "userName": "abx122",                 // From Users entity
        "email": "rahul@example.com",         // From Users entity
        "userRole": "customer",               // From Users entity
        "isVerified": true,                   // Derived from verification logic
        "profileImage": "https://cloudinary.com/image_url", // From User_Details entity
        "timeStamp": "2025-11-29T10:00:00Z"   // From Users entity
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
Returns all users with joined data from both Credential and UserDetail collections.
• URL Params
    None
• Data Params
    None
• Headers
    None
• Success Response:
    • Code: 200
    • Content: {
        success: true,
        data: [{
            _id: string,
            email: string,
            userName: string,
            name: string,
            mobile: string,
            userRole: string,
            isVerified: boolean,
            createdAt: string,
            userDetails: [{
                _id: string,
                userId: string,
                dob: string,
                address: string,
                city: string,
                state: string,
                pincode: string,
                gender: string,
                profileImage: string
            }]
        }]
    }
• Error Response:
    • Code: 500
    • Content: { error : "Failed to fetch users" }


2. GET  :-  /users/:id
--------------------------------------------------------------------------------------
Returns specific user with joined data from both Credential and UserDetail collections.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    None
• Success Response:
    • Code: 200
    • Content: {
        success: true,
        data: {
            _id: string,
            email: string,
            userName: string,
            name: string,
            mobile: string,
            userRole: string,
            isVerified: boolean,
            createdAt: string,
            userDetails: [{
                _id: string,
                userId: string,
                dob: string,
                address: string,
                city: string,
                state: string,
                pincode: string,
                gender: string,
                profileImage: string
            }]
        }
    }
• Error Response:
    • Code: 404
    • Content: { error : "User not found" }
    OR
    • Code: 500
    • Content: { error : "Failed to fetch user" }



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
        userName: string,
        mobile: string,
        userRole: string,
        password: string,
        email: string
         name: string,
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { <user_object> }
• Error Response:
    • Code: 400
    • Content: { error : "User already exists with this email" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }


5. POST  :- /users/verification/sendOTP
--------------------------------------------------------------------------------------
Sends an OTP to the user's registered mobile number for verification.
• URL Params
    None
• Data Params
    {
        mobile: string    //10digit number allow
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { message : "OTP sent successfully" }
• Error Response:
    • Code: 500
    • Content: { error : "Internal Server Error" }



6. POST  :- /users/verification/verifyOTP
--------------------------------------------------------------------------------------
Verifies the OTP sent to the user's mobile number for regular verification.
• URL Params
    None
• Data Params
    {
        mobile: string,     //10digit number allow
        otp: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { message : "OTP verified successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid OTP" }
    OR
    • Code: 404
    • Content: { error : "Mobile number not found" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }



7. POST  :- /users/login
--------------------------------------------------------------------------------------
Authenticates a user and returns an OAuth token.
• URL Params
    None
• Data Params
    {
    email: string, // access from user any of them email or username but with the field name as email
    password: string
    }

• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { success: true, message: "Logged in successfully" }
• Error Response:
    • Code: 401
    • Content: { success: false, message: "Invalid credentials" }
    OR
    • Code: 500
    • Content: { success: false, message: "Internal server error" }


8. POST  :- /users/forgetPassword/sendOTP
--------------------------------------------------------------------------------------
Sends OTP to user's registered mobile number for password reset. Requires both email and mobile for unique user identification.
• URL Params
    None
• Data Params
    {
        mobile: string,    //10digit number
        email: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { message : "OTP sent successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Mobile and email are required" }
    OR
    • Code: 404
    • Content: { error : "No account found with this mobile and email combination" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }


8.1. POST  :- /users/forgetPassword/verifyOTP
--------------------------------------------------------------------------------------
Verifies OTP for password reset and returns JWT reset token.
• URL Params
    None
• Data Params
    {
        mobile: string,
        email: string,
        otp: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { message : "OTP verified successfully", resetToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
    Note: resetToken is a JWT with 10-minute expiry containing user data and purpose validation
• Error Response:
    • Code: 400
    • Content: { error : "Mobile, email and OTP are required" }
    OR
    • Content: { error : "Invalid OTP" }
    OR
    • Code: 404
    • Content: { error : "User not found" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }


8.2. POST  :- /users/forgetPassword/resetPassword
--------------------------------------------------------------------------------------
Resets password using JWT reset token. Token is verified for signature, expiry, and purpose. Password is automatically hashed and user is logged in after successful reset.
• URL Params
    None
• Data Params
    {
        resetToken: string,    // JWT token from step 8.1
        newPassword: string
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { 
        message: "Password reset successfully",
        user: {<user_object>}
    }
    Note: Auth token is automatically set in cookie for auto-login
• Error Response:
    • Code: 400
    • Content: { error : "Reset token and new password are required" }
    OR
    • Content: { error : "Invalid or expired reset token" }
    OR
    • Content: { error : "Invalid token purpose" }
    OR
    • Code: 404
    • Content: { error : "User not found" }
    OR
    • Code: 500
    • Content: { error : "Internal Server Error" }

Note: Forget Password Flow (JWT-based):
1. User enters mobile + email → call /users/forgetPassword/sendOTP
2. User enters OTP → call /users/forgetPassword/verifyOTP (returns JWT resetToken with 10min expiry)
3. User enters new password → call /users/forgetPassword/resetPassword (JWT verified + auto-login)

Security Features:
- JWT tokens are cryptographically signed and tamper-proof
- Built-in expiry (10 minutes) with automatic validation
- Purpose validation prevents token misuse
- Stateless (no server storage required)
- Same JWT library as login/signup for consistency



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


11. POST  :- /users/verifyPan
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


12. POST  :- /users/verifyGst
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


13. POST  :- /users/profileDetails
--------------------------------------------------------------------------------------
Adds user details with profile image upload in single request.
• URL Params
    None
• Data Params (multipart/form-data)
    {
        dob: string,
        address: string,
        city: string,
        state: string,
        pincode: string,
        gender: string,
        profileImage: File // optional image file
    }
• Headers
    Content-Type: multipart/form-data
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: {
        success: true,
        message: "User details saved successfully",
        data: {<userDetail_object>}
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid user details" }
    OR
    • Code: 401
    • Content: { error : "Unauthorized" }
    OR
    • Code: 500
    • Content: { success: false, message: "Failed to save user details" }


13.1. PUT  :- /users/profileDetails
--------------------------------------------------------------------------------------
Updates user profile details with optional new profile image upload.
• URL Params
    None
• Data Params (multipart/form-data)
    {
        userName: string (optional),
        name: string (optional),
        dob: string,
        address: string,
        city: string,
        state: string,
        pincode: string,
        gender: string,
        profileImage: File (optional) // new image file to upload
    }
• Headers
    Content-Type: multipart/form-data
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        success: true,
        message: "Profile updated successfully"
    }
• Error Response:
    • Code: 401
    • Content: { error : "Unauthorized" }
    OR
    • Code: 500
    • Content: { success: false, message: "Failed to update profile" }


13.2. POST  :- /users/sellerDetails
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


13.3. POST  :- /users/bankDetails
--------------------------------------------------------------------------------------
Adds seller bank details for payments.
• URL Params
    None
• Data Params
    {
        accountNo: string,
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



13.4. POST  :- /users/verify-bank-account
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


13.5. POST  :- /users/refresh-token
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





▣ Products:
    • Product Object
        {
        "productId": "product_123",
        "userId": "user_456",
        "productName": "Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "categoryId": "category_789",
        "deepestCategoryName": "SweatShirt",
        "categoryPath": "fashion-man-shirt-casual-solid",
        "price": 2999.99,
        "inStock": true,
        "productImageId": ["image_123", "image_456"],
        "timeStamp": "2025-11-29T10:00:00Z"
        }

    • Category Object
        {
        "categoryId": "category_123",
        "name": "Electronics",
        "parentId": null, // for subcategories
        "slug": "url_format"
        }

    • Inventory Object
        {
        "inventoryId": "inventory_123",
        "userId": "user_546",
        "productId": "product_4564",
        "quantity": 200,
        "timeStamp": "2025-11-29T10:00:00Z"
        }
    • Review Object
        {
        "reviewId": "review_123",
        "userId": "user_456",
        "productId": "product_989",
        "comment": "Premium electronics brand",
        "rating": 5,
        "images": ["https://cloudinary.com/review1.jpg"],
        "timeStamp": "2025-11-29T10:00:00Z"
        }

19. GET :- /products
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

20. POST :- /product/addProduct
--------------------------------------------------------------------------------------
Creates a new product with images (seller only). Uses multipart/form-data for file uploads.
• URL Params
    None
• Data Params (multipart/form-data)
    {
        "productName": "string",
        "description": "string",
        "categoryId": "string", // ID of the deepest/leaf category
        "deepestCategoryName": "string", // Name of the deepest category
        "categoryPath": "string", // JSON stringified array: [{id, name}, {id, name}]
        "price": "number",
        "quantity": "number", // inventory quantity
        "images": [File, File, File] // multiple image files
    }
• Headers
    Content-Type: multipart/form-data
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product added successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid product data" }
    OR
    • Code: 401
    • Content: { error : "Unauthorized - Seller access required" }
    OR
    • Code: 500
    • Content: { success: false, message: "Server error" }

21. PUT :- /products/:id
--------------------------------------------------------------------------------------
Updates the specified product (seller only - own products).
• URL Params
    Required: id=[string]
• Data Params
    {
        "productName": "string",
        "description": "string",
        "categoryId": "string",
        "deepestCategoryName": "string",
        "categoryPath": "string",
        "price": "number",
        "inStock": "boolean",
        "productImageId": ["string"]
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

23. GET :- /products/seller/:userId
--------------------------------------------------------------------------------------
Returns all products for a specific seller.
• URL Params
    Required: userId=[string] // User ID where role='seller'
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

26. GET :- /category/root
--------------------------------------------------------------------------------------
Returns all main/root categories (parent_id: null) with hasChildren flag.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: [
        {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
            "name": "Electronics",
            "parent_id": null,
            "hasChildren": true
        },
        {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
            "name": "Books",
            "parent_id": null,
            "hasChildren": false
        }
    ]
• Error Response:
    • Code: 500
    • Content: { error : "Server error" }

26.1. GET :- /category/:parentId/children
--------------------------------------------------------------------------------------
Returns all subcategories for a given parent category with hasChildren flag.
• URL Params
    Required: parentId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: [
        {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
            "name": "Smartphones",
            "parent_id": "64f1a2b3c4d5e6f7g8h9i0j1",
            "hasChildren": true
        },
        {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
            "name": "Laptops",
            "parent_id": "64f1a2b3c4d5e6f7g8h9i0j1",
            "hasChildren": false
        }
    ]
• Error Response:
    • Code: 500
    • Content: { error : "Server error" }

26.2. GET :- /category/tree
--------------------------------------------------------------------------------------
Returns complete hierarchical category tree (optional - for advanced use).
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: [
        {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
            "name": "Electronics",
            "parent_id": null,
            "children": [
                {
                    "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
                    "name": "Smartphones",
                    "parent_id": "64f1a2b3c4d5e6f7g8h9i0j1",
                    "children": []
                }
            ]
        }
    ]
• Error Response:
    • Code: 500
    • Content: { error : "Server error" }


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
                "reviewId": "review_123",
                "userId": "user_456",
                "productId": "product_123",
                "rating": 5,
                "comment": "Excellent product!",
                "images": ["https://cloudinary.com/review1.jpg"],
                "timeStamp": "2025-11-29T10:00:00Z"
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
                "cartItemId": "cartitem_123",
                "productId": "product_123",
                "product": {<product_object>},
                "quantity": 2,
                "priceAtAdd": 2999.99,
                "isAvailable": true,
                "timeStamp": "2025-11-29T10:00:00Z"
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