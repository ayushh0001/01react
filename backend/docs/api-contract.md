*****always keep in mind that while desinging the api contract think that what data/field the client need for the UI if that feild is not into that particular entity or it is in related entity but you just add those field in the object*****

Base URL (for localhost):- "http://localhost:5000/api/v1/"
Base URL (for render deployed):- "https://zpin-ecommerce-backend-997x.onrender.com/api/v1/"

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
        "details": {<user_details_object_with_coordinates>},
        "sellerDetails": {<seller_details_object>}, // if seller
        "bankDetails": {<bank_details_object>} // if  seller
        }

    • User Details Object (Enhanced with Location)
        {
        "_id": "userdetail_123",
        "userId": "user_456",
        "dob": "1990-05-15",
        "address": "Shop 15, Linking Road, Bandra West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400050",
        "coordinates": {
            "type": "Point",
            "coordinates": [72.8294, 19.0544] // [longitude, latitude]
        },
        "gender": "male",
        "profileImage": "https://cloudinary.com/image_url",
        "createdAt": "2025-11-29T10:00:00Z"
        }

1. GET :- /api/v1/users
--------------------------------------------------------------------------------------
Returns all users with joined data from both Credential and UserDetail collections with pagination.
• URL Params
    Optional: page=[number], limit=[number]
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
        }],
        pagination: {<pagination_object>}
    }
• Error Response:
    • Code: 500
    • Content: { error : "Failed to fetch users" }


2. GET  :-  /api/v1/users/:id
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



3. GET  :- /api/v1/users/orders
--------------------------------------------------------------------------------------
Returns all Orders associated with the authenticated user with pagination.
• URL Params
    Optional: page=[number], limit=[number]
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
            ],
        pagination: {<pagination_object>}
        }
• Error Response:
    • Code: 401
    • Content: { error : "You are unauthorized to make this request." }


4. POST  :- /api/v1/auth/signup
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


5. POST  :- /api/v1/auth/verification/sendOTP
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



6. POST  :- /api/v1/auth/verification/verifyOTP
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



7. POST  :- /api/v1/auth/login
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


8. POST  :- /api/v1/auth/forgetPassword/sendOTP
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


8.1. POST  :- /api/v1/auth/forgetPassword/verifyOTP
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


8.2. POST  :- /api/v1/auth/forgetPassword/resetPassword
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

9. POST  :- /api/v1/auth/logout
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

10. POST  :- /api/v1/verification/verifyPan
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
    Authorization: Bearer <OAuth Token>
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
    OR
    • Code: 401
    • Content: { error : "Unauthorized" }


12. POST  :- /api/v1/verification/verifyGst
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
    Authorization: Bearer <OAuth Token>
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
    OR
    • Code: 401
    • Content: { error : "Unauthorized" }


13. POST  :- /api/v1/users/profileDetails
--------------------------------------------------------------------------------------
Adds user details with profile image upload and automatic coordinate generation.
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
        data: {
            <userDetail_object_with_coordinates>,
            "coordinates": {
                "type": "Point",
                "coordinates": [72.8294, 19.0544] // Auto-generated from address
            }
        }
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
• Note: System automatically converts address to coordinates for location-based features


13.1. PUT  :- /api/v1/users/profileDetails
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


13.2. POST  :- /api/v1/users/sellerDetails
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


13.3. POST  :- /api/v1/users/bankDetails
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



13.4. POST  :- /api/v1/users/verify-bank-account
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


13.5. POST  :- /api/v1/users/refresh-token
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


▣ Location Services (Development Only):

    • Location Object
        {
        "coordinates": [72.8777, 19.0760], // [longitude, latitude]
        "location": {
            "city": "Mumbai",
            "state": "Maharashtra", 
            "pincode": "400001"
        }
        }

13.6. POST  :- /api/v1/public/location/coordinates
--------------------------------------------------------------------------------------
**DEVELOPMENT ONLY** - Converts user's pincode/city to coordinates when Google Maps API key is not available.
**NOTE: This endpoint will be REMOVED when you get Google Maps API key**
• URL Params
    None
• Data Params
    {
        pincode: string, // optional
        city: string,    // optional (either pincode or city required)
        state: string    // optional
    }
• Headers
    Content-Type: application/json
    **No Authorization Required** (Public endpoint)
• Success Response:
    • Code: 200
    • Content: {
        success: true,
        coordinates: [72.8777, 19.0760], // [longitude, latitude]
        location: {
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001"
        }
    }
• Error Response:
    • Code: 400
    • Content: { message: "Please provide either pincode or city" }
    OR
    • Code: 500
    • Content: { message: "Error getting location coordinates" }
• Usage Examples:
    - POST /api/v1/public/location/coordinates { "pincode": "400001" }
    - POST /api/v1/public/location/coordinates { "city": "Mumbai", "state": "Maharashtra" }
• **IMPORTANT**: Remove this endpoint when you have Google Maps API key. Frontend will use browser GPS directly.


▣ Products:
    • Product Object (Enhanced with Location)
        {
        "productId": "product_123",
        "userId": "user_456",
        "productName": "Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "categoryId": "category_789",
        "deepestCategoryName": "SweatShirt",
        "categoryPath": "fashion-man-shirt-casual-solid",
        "price": 2999.99,
        "quantity": 50,
        "inStock": true,
        "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
        "sellerLocation": {
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400050",
            "coordinates": {
                "type": "Point",
                "coordinates": [72.8294, 19.0544] // [longitude, latitude]
            }
        },
        "distance": 2.5, // Distance in km from user's location (only in search results)
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

    • Pagination Object
        {
        "currentPage": 1,
        "totalPages": 10,
        "totalItems": 95,
        "itemsPerPage": 10,
        "hasNextPage": true,
        "hasPrevPage": false
        }

19. GET :- /api/v1/products
--------------------------------------------------------------------------------------
Returns all products with location-based filtering and pagination.
• URL Params
    Optional: 
    - page=[number] (default: 1)
    - limit=[number] (default: 10)
    - lat=[number] (user latitude for 25km radius search)
    - lng=[number] (user longitude for 25km radius search)
    - city=[string] (fallback location filter)
    - state=[string] (fallback location filter)
    - pincode=[string] (fallback location filter)
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "products": [{
            <product_object_with_distance>, // includes distance field when lat/lng provided
            "distance": 2.5 // km from user location
        }],
        "pagination": {<pagination_object>},
        "locationInfo": {
            "searchRadius": 25, // km
            "userLocation": {
                "lat": 19.1136,
                "lng": 72.8697
            },
            "totalNearbyProducts": 45
        }
    }
• Examples:
    - GET /api/v1/products?lat=19.1136&lng=72.8697 (25km radius search)
    - GET /api/v1/products?city=Mumbai (city-based search)
    - GET /api/v1/products (all products)

20. GET :- /api/v1/products/:id
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

21. POST :- /api/v1/products/addProduct
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

22. PUT :- /api/v1/products/:id
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

23. DELETE :- /api/v1/products/:id
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

24. GET :- /api/v1/products/seller/:userId
--------------------------------------------------------------------------------------
Returns all products for a specific seller with pagination.
• URL Params
    Required: userId=[string] // User ID where role='seller'
    Optional: page=[number], limit=[number]
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

25. GET :- /api/v1/products/category/:categoryId
--------------------------------------------------------------------------------------
Returns all products in a specific category with location-based filtering and pagination.
• URL Params
    Required: categoryId=[string]
    Optional: 
    - page=[number], limit=[number]
    - lat=[number] (user latitude for 25km radius search)
    - lng=[number] (user longitude for 25km radius search)
    - city=[string] (fallback location filter)
    - state=[string] (fallback location filter)
    - pincode=[string] (fallback location filter)
• Data Params
    None
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content:
    {
        "products": [{
            <product_object_with_distance>,
            "distance": 3.2 // km from user location
        }],
        "pagination": {<pagination_object>},
        "categoryInfo": {
            "categoryId": "category_123",
            "categoryName": "Electronics"
        },
        "locationInfo": {
            "searchRadius": 25,
            "userLocation": { "lat": 19.1136, "lng": 72.8697 },
            "totalNearbyProducts": 12
        }
    }

26. POST :- /api/v1/products/:id/approve
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

26. GET :- /api/v1/categories/root
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

26.1. GET :- /api/v1/categories/:parentId/children
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

26.2. GET :- /api/v1/categories/tree
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

31. GET :- /api/v1/products/:id/reviews
--------------------------------------------------------------------------------------
Returns all reviews for a product with pagination.
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
        "reviews": [{<review_object>}],
        "pagination": {<pagination_object>}
    }
• Error Response:
    • Code: 404
    • Content: { error : "Product not found" }
                "userId": "user_456",
                "productId": "product_123",
                "rating": 5,
                "comment": "Excellent product!",
                "images": ["https://cloudinary.com/review1.jpg"],
                "timeStamp": "2025-11-29T10:00:00Z"
            }
        ]

    }

32. POST :- /api/v1/products/:id/reviews
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

33. GET :- /api/v1/wishlist
--------------------------------------------------------------------------------------
Returns user's wishlist with pagination.
• URL Params
    Optional: page=[number], limit=[number]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content:
    {
        "wishlist": [{<product_object>}],
        "pagination": {<pagination_object>}
    }

33.1. GET :- /api/v1/wishlist/count
--------------------------------------------------------------------------------------
Returns the count of items in user's wishlist.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "count": 5 }
• Error Response:
    • Code: 401
    • Content: { error : "Unauthorized" }

34. POST :- /api/v1/wishlist
--------------------------------------------------------------------------------------
Adds product to wishlist.
• URL Params
    None
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

35. DELETE :- /api/v1/wishlist/:productId
--------------------------------------------------------------------------------------
Removes product from wishlist.
• URL Params
    Required: productId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product removed from wishlist" }
35.1. DELETE :- /api/v1/wishlist/clear
--------------------------------------------------------------------------------------
Clears entire wishlist.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Wishlist cleared successfully" }



▣ Cart:

36. GET :- /api/v1/cart
--------------------------------------------------------------------------------------
Returns user's cart items.
• URL Params
    None
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

37. POST :- /api/v1/cart
--------------------------------------------------------------------------------------
Adds product to cart. (in cart component we'll use useEffect so when page load it will get items added in the cart, and when quantity increase just make update request for cart item update and refresh page so the subtotal will be update )
• URL Params
    None
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


38. PUT :- /api/v1/cart/:productId
--------------------------------------------------------------------------------------
Updates quantity of product in cart.
• URL Params
    Required: productId=[string]
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


39. DELETE :- /api/v1/cart/:productId
--------------------------------------------------------------------------------------
Removes product from cart.
• URL Params
    Required: productId=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Product removed from cart" }


40. DELETE :- /api/v1/cart
--------------------------------------------------------------------------------------
Clears entire cart.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message : "Cart cleared successfully" }

40.1. GET :- /api/v1/cart/count
--------------------------------------------------------------------------------------
Returns the count of items in user's cart.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "count": 3 }
• Error Response:
    • Code: 401
    • Content: { error : "Unauthorized" }



▣ Orders:

    • Order Object (Complete - Used by Customer, Seller & Delivery Partner)
        {
        // Core Order Fields (visible to all roles)
        "id": "order_123",
        "userId": "user_456",
        "sellerId": "seller_789", // Added for seller identification
        "orderNumber": "ORD-2025-001234",
        "status": "pending", // pending, confirmed, processing, shipped, delivered, cancelled, returned
        "paymentStatus": "paid", // pending, paid, failed, refunded
        "totalAmount": 7499.97,
        "shippingAmount": 99.00,
        "taxAmount": 674.99,
        "finalAmount": 7273.96,
        
        // Address Information
        "shippingAddress": {
            "name": "John Doe",
            "phone": "9876543210",
            "address": "123 Main St",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "landmark": "Near Metro Station",
            "coordinates": { // Added for delivery partner navigation
                "type": "Point",
                "coordinates": [72.8777, 19.0760] // [longitude, latitude]
            }
        },
        "billingAddress": {<same_structure_as_shipping>},
        
        // Pickup Address (for delivery partner)
        "pickupAddress": {
            "name": "ABC Store",
            "phone": "9876543211",
            "address": "Shop 15, Linking Road, Bandra West",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400050",
            "coordinates": {
                "type": "Point",
                "coordinates": [72.8294, 19.0544]
            },
            "landmark": "Near Metro Station"
        },
        
        // Payment Information (hidden from delivery partner)
        "paymentMethod": "razorpay", // razorpay, cod, wallet
        "paymentId": "pay_razorpay_123",
        
        // Delivery Information (added for delivery partner)
        "deliveryBoyId": "delivery_boy_101", // null if not assigned
        "deliveryStatus": "assigned", // assigned, accepted, picked_up, in_transit, delivered
        "deliveryFee": 50.00,
        "partnerEarning": 35.00, // delivery partner's earning
        "distance": 5.2, // km between pickup and delivery
        "estimatedTime": 25, // minutes for delivery
        "otp": "1234", // for delivery verification
        "assignedAt": "2025-11-29T12:00:00Z",
        "acceptedAt": null,
        "pickedUpAt": null,
        "deliveredAt": null,
        
        // Order Items (simplified for delivery partner)
        "items": [
            {
                "productId": "product_123",
                "productName": "Wireless Headphones", // Added for delivery partner
                "quantity": 2,
                "price": 2999.99,
                "image": "https://cloudinary.com/product1.jpg" // Added for delivery partner
            }
        ],
        
        // Tracking & Delivery
        "estimatedDelivery": "2025-12-05T18:00:00Z",
        "actualDelivery": null,
        "trackingNumber": "TRK123456789",
        "notes": "Handle with care",
        "specialInstructions": "Ring doorbell twice", // Added for delivery partner
        
        // Timestamps
        "createdAt": "2025-11-29T10:00:00Z",
        "updatedAt": "2025-11-29T10:00:00Z"
        }
        
    • Role-Based Response Views:
        - Customer View: Excludes deliveryBoyId, partnerEarning, otp
        - Seller View: Excludes customer payment details, otp
        - Delivery Partner View: Excludes paymentMethod, paymentId, totalAmount details

▣ Delivery Partners:

    • Delivery Partner Object
        {
        "id": "delivery_partner_123",
        "name": "Rajesh Kumar",
        "email": "rajesh@example.com",
        "phone": "9876543210",
        "profileImage": "https://cloudinary.com/profile1.jpg",
        "vehicleType": "bike", // bike, scooter, car, bicycle
        "vehicleNumber": "MH01AB1234",
        "isOnline": true,
        "isVerified": true,
        "rating": 4.5,
        "totalDeliveries": 150,
        "status": "active", // active, inactive, suspended
        "currentLocation": {
            "type": "Point",
            "coordinates": [72.8777, 19.0760] // [longitude, latitude]
        },
        "joinedDate": "2025-01-15T00:00:00Z",
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-11-29T10:00:00Z"
        }

▣ Delivery Earnings:

    • Delivery Earnings Object
        {
        "id": "earning_123",
        "deliveryPartnerId": "delivery_partner_123",
        "orderId": "order_456",
        "baseAmount": 30.00,
        "distanceBonus": 5.00,
        "timeBonus": 0.00,
        "totalAmount": 35.00,
        "distance": 5.2, // km traveled for delivery
        "status": "completed", // pending, completed, cancelled, disputed
        "paidAt": "2025-11-29T18:00:00Z",
        "createdAt": "2025-11-29T10:00:00Z",
        "updatedAt": "2025-11-29T18:00:00Z"
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

▣ DELIVERY PARTNER ENDPOINTS:

54. POST :- /delivery-partners/register
--------------------------------------------------------------------------------------
Registers a new delivery partner.
• URL Params
    None
• Data Params
    {
        "name": "Rajesh Kumar",
        "email": "rajesh@example.com",
        "phone": "9876543210",
        "vehicleType": "bike",
        "vehicleNumber": "MH01AB1234",
        "profileImage": "base64_image_data"
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 201
    • Content: {
        "deliveryPartner": {<delivery_partner_object>},
        "message": "Registration successful. Verification pending."
    }
• Error Response:
    • Code: 400
    • Content: { error : "Phone number already registered" }

55. GET :- /delivery-partners/profile
--------------------------------------------------------------------------------------
Returns delivery partner profile.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "deliveryPartner": {<delivery_partner_object>}
    }
• Error Response:
    • Code: 404
    • Content: { error : "Delivery partner not found" }

56. PUT :- /delivery-partners/profile
--------------------------------------------------------------------------------------
Updates delivery partner profile.
• URL Params
    None
• Data Params
    {
        "name": "Updated Name",
        "vehicleType": "car",
        "vehicleNumber": "MH01CD5678",
        "profileImage": "base64_image_data"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "deliveryPartner": {<delivery_partner_object>}
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid vehicle number format" }

57. PUT :- /delivery-partners/location
--------------------------------------------------------------------------------------
Updates delivery partner current location.
• URL Params
    None
• Data Params
    {
        "latitude": 19.0760,
        "longitude": 72.8777
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message: "Location updated successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid coordinates" }

58. PUT :- /delivery-partners/status
--------------------------------------------------------------------------------------
Updates delivery partner online/offline status.
• URL Params
    None
• Data Params
    {
        "isOnline": true
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { message: "Status updated successfully" }
• Error Response:
    • Code: 400
    • Content: { error : "Cannot go online. Verification pending." }

59. GET :- /delivery-partners/orders
--------------------------------------------------------------------------------------
Returns assigned orders for delivery partner.
• URL Params
    Optional: status=[string] // assigned, accepted, picked_up, in_transit
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "orders": [{<order_object>}],
        "count": 5
    }
• Error Response:
    • Code: 401
    • Content: { error : "Unauthorized" }

60. PUT :- /delivery-partners/orders/:id/accept
--------------------------------------------------------------------------------------
Accepts an assigned order.
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
        "order": {<order_object>},
        "message": "Order accepted successfully"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Order already accepted by another partner" }

61. PUT :- /delivery-partners/orders/:id/pickup
--------------------------------------------------------------------------------------
Marks order as picked up from seller.
• URL Params
    Required: id=[string] // order ID
• Data Params
    {
        "otp": "1234" // pickup verification OTP
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "order": {<order_object>},
        "message": "Order picked up successfully"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid OTP" }

62. PUT :- /delivery-partners/orders/:id/deliver
--------------------------------------------------------------------------------------
Marks order as delivered to customer.
• URL Params
    Required: id=[string] // order ID
• Data Params
    {
        "otp": "5678", // delivery verification OTP
        "deliveryImage": "base64_image_data" // optional proof of delivery
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "order": {<order_object>},
        "earning": {<delivery_earning_object>},
        "message": "Order delivered successfully"
    }
• Error Response:
    • Code: 400
    • Content: { error : "Invalid delivery OTP" }

▣ DELIVERY EARNINGS ENDPOINTS:

63. GET :- /delivery-partners/earnings
--------------------------------------------------------------------------------------
Returns delivery partner earnings history.
• URL Params
    Optional: page=[number], limit=[number], status=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "earnings": [{<delivery_earning_object>}],
        "totalEarnings": 2500.00,
        "pendingEarnings": 150.00,
        "completedEarnings": 2350.00,
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 50
        }
    }
• Error Response:
    • Code: 401
    • Content: { error : "Unauthorized" }

64. GET :- /delivery-partners/earnings/summary
--------------------------------------------------------------------------------------
Returns earnings summary for different time periods.
• URL Params
    Optional: period=[string] // today, week, month, year
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "today": {
            "totalEarnings": 250.00,
            "deliveries": 8,
            "avgEarningPerDelivery": 31.25
        },
        "thisWeek": {
            "totalEarnings": 1750.00,
            "deliveries": 56,
            "avgEarningPerDelivery": 31.25
        },
        "thisMonth": {
            "totalEarnings": 7500.00,
            "deliveries": 240,
            "avgEarningPerDelivery": 31.25
        }
    }
• Error Response:
    • Code: 401
    • Content: { error : "Unauthorized" }

65. GET :- /delivery-partners/earnings/:id
--------------------------------------------------------------------------------------
Returns specific earning details.
• URL Params
    Required: id=[string] // earning ID
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "earning": {<delivery_earning_object>},
        "order": {<order_object>}
    }
• Error Response:
    • Code: 404
    • Content: { error : "Earning record not found" }ignature" }



▣ DELIVERY PARTNER SYSTEM:
======================================================================================

▣ Delivery Partner Objects:

    • Delivery Partner Object
        {
        "id": "partner_123",
        "name": "Rahul Sharma",
        "mobile": "9876543210",
        "email": "rahul@example.com",
        "profileImage": "https://cloudinary.com/image_url",
        "isOnline": true,
        "isVerified": true,
        "vehicleType": "bike", // bike, scooter, car
        "vehicleNumber": "MH01AB1234",
        "currentLocation": {
            "type": "Point",
            "coordinates": [72.8294, 19.0544] // [longitude, latitude]
        },
        "rating": 4.8,
        "totalDeliveries": 1250,
        "joinedDate": "2025-01-15T10:00:00Z",
        "status": "active", // active, inactive, suspended
        "timeStamp": "2025-11-29T10:00:00Z"
        }

    • Earning Object
        {
        "id": "earning_123",
        "partnerId": "partner_456",
        "orderId": "order_789",
        "orderNumber": "ORD-2025-001234",
        "baseAmount": 35.00,
        "tip": 10.00,
        "incentive": 5.00,
        "bonus": 0.00,
        "totalAmount": 50.00,
        "distance": 5.2,
        "deliveryTime": 25, // minutes
        "date": "2025-11-29T10:00:00Z",
        "status": "credited", // pending, credited, failed
        "payoutId": "payout_123" // if included in payout
        }

    • Document Object
        {
        "id": "doc_123",
        "partnerId": "partner_456",
        "type": "driving_license", // driving_license, aadhar, pan, vehicle_rc, insurance
        "documentNumber": "DL1420110012345",
        "imageUrl": "https://cloudinary.com/doc_image.jpg",
        "status": "verified", // pending, verified, rejected
        "verifiedAt": "2025-11-29T10:00:00Z",
        "expiryDate": "2030-11-29",
        "rejectionReason": null,
        "uploadedAt": "2025-11-29T10:00:00Z"
        }


▣ DELIVERY PARTNER AUTHENTICATION:
======================================================================================

54. POST :- /api/v1/auth/partner/signup
--------------------------------------------------------------------------------------
Creates a new delivery partner account.
• URL Params
    None
• Data Params
    {
        "name": "string",
        "mobile": "string", // 10 digits
        "email": "string",
        "password": "string",
        "vehicleType": "string", // bike, scooter, car
        "vehicleNumber": "string",
        "city": "string"
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 201
    • Content: { "partner": {<partner_object>}, "message": "Account created successfully" }
• Error Response:
    • Code: 400
    • Content: { "error": "Partner already exists with this mobile" }

55. POST :- /api/v1/auth/partner/login
--------------------------------------------------------------------------------------
Authenticates delivery partner and returns token.
• URL Params
    None
• Data Params
    {
        "mobile": "string", // or email
        "password": "string"
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { "success": true, "partner": {<partner_object>}, "token": "jwt_token" }
• Error Response:
    • Code: 401
    • Content: { "success": false, "message": "Invalid credentials" }

56. POST :- /api/v1/auth/partner/sendOTP
--------------------------------------------------------------------------------------
Sends OTP for mobile verification.
• URL Params
    None
• Data Params
    {
        "mobile": "string"
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { "message": "OTP sent successfully" }

57. POST :- /api/v1/auth/partner/verifyOTP
--------------------------------------------------------------------------------------
Verifies OTP for mobile verification.
• URL Params
    None
• Data Params
    {
        "mobile": "string",
        "otp": "string"
    }
• Headers
    Content-Type: application/json
• Success Response:
    • Code: 200
    • Content: { "message": "OTP verified successfully", "verified": true }


▣ DELIVERY PARTNER PROFILE:
======================================================================================

58. GET :- /api/v1/partner/profile
--------------------------------------------------------------------------------------
Returns partner profile information.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "partner": {<partner_object>} }

59. PUT :- /api/v1/partner/profile
--------------------------------------------------------------------------------------
Updates partner profile information.
• URL Params
    None
• Data Params (multipart/form-data)
    {
        "name": "string",
        "email": "string",
        "vehicleType": "string",
        "vehicleNumber": "string",
        "profileImage": "File" // optional
    }
• Headers
    Content-Type: multipart/form-data
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Profile updated successfully" }

60. POST :- /api/v1/partner/location
--------------------------------------------------------------------------------------
Updates partner's current location.
• URL Params
    None
• Data Params
    {
        "latitude": "number",
        "longitude": "number"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Location updated successfully" }

61. PUT :- /api/v1/partner/status
--------------------------------------------------------------------------------------
Updates partner's online/offline status.
• URL Params
    None
• Data Params
    {
        "isOnline": "boolean"
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Status updated successfully", "isOnline": true }


▣ DELIVERY ORDER MANAGEMENT:
======================================================================================

62. GET :- /api/v1/partner/orders/available
--------------------------------------------------------------------------------------
Returns available orders for assignment based on partner location.
• URL Params
    Optional: radius=[number] (default: 10km)
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "orders": [{<order_object_delivery_view>}], "count": 5 }
• Note: Returns order object with delivery partner view (excludes payment details)

63. GET :- /api/v1/partner/orders
--------------------------------------------------------------------------------------
Returns partner's assigned/accepted orders with pagination.
• URL Params
    Optional: page=[number], limit=[number], status=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "orders": [{<order_object_delivery_view>}], "pagination": {<pagination_object>} }

64. GET :- /api/v1/partner/orders/:id
--------------------------------------------------------------------------------------
Returns specific order details for delivery partner.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "order": {<order_object_delivery_view>} }
• Note: Returns filtered order object excluding payment sensitive data

65. POST :- /api/v1/partner/orders/:id/accept
--------------------------------------------------------------------------------------
Accepts an assigned order.
• URL Params
    Required: id=[string]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Order accepted successfully", "order": {<order_object_delivery_view>} }

66. POST :- /api/v1/partner/orders/:id/reject
--------------------------------------------------------------------------------------
Rejects an assigned order.
• URL Params
    Required: id=[string]
• Data Params
    {
        "reason": "string" // optional
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Order rejected successfully" }

67. PUT :- /api/v1/partner/orders/:id/status
--------------------------------------------------------------------------------------
Updates order delivery status during delivery process.
• URL Params
    Required: id=[string]
• Data Params
    {
        "status": "string", // picked_up, in_transit, delivered
        "latitude": "number", // current location
        "longitude": "number",
        "notes": "string", // optional
        "otp": "string" // required for delivery confirmation
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Order status updated successfully", "order": {<order_object_delivery_view>} }

68. POST :- /api/v1/partner/orders/:id/issue
--------------------------------------------------------------------------------------
Reports an issue with the order.
• URL Params
    Required: id=[string]
• Data Params
    {
        "issueType": "string", // customer_unavailable, wrong_address, payment_issue, damaged_item
        "description": "string",
        "images": ["string"] // optional image URLs
    }
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "message": "Issue reported successfully", "issueId": "issue_123" }


▣ DELIVERY PARTNER EARNINGS:
======================================================================================

69. GET :- /api/v1/partner/earnings
--------------------------------------------------------------------------------------
Returns partner's earnings with filtering options.
• URL Params
    Optional: period=[string] (today, week, month), page=[number], limit=[number]
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "earnings": [{<earning_object>}],
        "summary": {
            "totalEarnings": 7644.00,
            "totalDeliveries": 84,
            "totalTips": 890.00,
            "totalIncentives": 620.00,
            "averagePerDelivery": 91.00
        },
        "pagination": {<pagination_object>}
    }

70. GET :- /api/v1/partner/earnings/summary
--------------------------------------------------------------------------------------
Returns earnings summary for different periods.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: {
        "today": {
            "earnings": 856.00,
            "deliveries": 12,
            "tips": 125.00,
            "incentives": 85.00
        },
        "week": {
            "earnings": 7644.00,
            "deliveries": 84,
            "tips": 890.00,
            "incentives": 620.00
        },
        "month": {
            "earnings": 28540.00,
            "deliveries": 312,
            "tips": 3240.00,
            "incentives": 2180.00
        }
    }


▣ NAVIGATION & ROUTE APIS:
======================================================================================

71. GET :- /api/v1/partner/orders/:id/route
--------------------------------------------------------------------------------------
Returns optimized route for order delivery.
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
        "route": {
            "distance": 5.2, // km
            "duration": 25, // minutes
            "steps": [
                {
                    "instruction": "Head north on Main St",
                    "distance": 0.5,
                    "duration": 2
                }
            ],
            "polyline": "encoded_polyline_string",
            "pickupLocation": {
                "latitude": 19.0544,
                "longitude": 72.8294
            },
            "deliveryLocation": {
                "latitude": 19.0760,
                "longitude": 72.8777
            }
        }
    }

72. GET :- /api/v1/partner/orders/:id/navigation-links
--------------------------------------------------------------------------------------
Returns deep links for external navigation apps.
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
        "googleMaps": "https://maps.google.com/maps?daddr=19.0760,72.8777",
        "appleMaps": "http://maps.apple.com/?daddr=19.0760,72.8777",
        "pickupAddress": "Shop 15, Linking Road, Bandra West",
        "deliveryAddress": "123 Main St, Apartment 4B"
    }


▣ DOCUMENT MANAGEMENT:
======================================================================================

73. GET :- /api/v1/partner/documents
--------------------------------------------------------------------------------------
Returns partner's uploaded documents.
• URL Params
    None
• Data Params
    None
• Headers
    Content-Type: application/json
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 200
    • Content: { "documents": [{<document_object>}] }

74. POST :- /api/v1/partner/documents
--------------------------------------------------------------------------------------
Uploads new document.
• URL Params
    None
• Data Params (multipart/form-data)
    {
        "type": "string", // driving_license, aadhar, pan, vehicle_rc, insurance
        "documentNumber": "string",
        "expiryDate": "string", // YYYY-MM-DD, optional
        "documentImage": "File"
    }
• Headers
    Content-Type: multipart/form-data
    Authorization: Bearer <OAuth Token>
• Success Response:
    • Code: 201
    • Content: { "message": "Document uploaded successfully", "document": {<document_object>} }


▣ COMMON OBJECTS:
======================================================================================

    • Pagination Object
        {
        "currentPage": 1,
        "totalPages": 10,
        "totalItems": 95,
        "itemsPerPage": 10,
        "hasNextPage": true,
        "hasPrevPage": false
        }

    • Error Response Format
        {
        "success": false,
        "error": "Error message",
        "code": "ERROR_CODE", // optional
        "details": {} // optional additional details
        }


▣ IMPORTANT NOTES:
======================================================================================

• ROLE-BASED DATA FILTERING:
  - Customer APIs: Hide deliveryBoyId, partnerEarning, otp
  - Seller APIs: Hide customer payment details, otp  
  - Delivery Partner APIs: Hide paymentMethod, paymentId, sensitive amounts

• AUTHENTICATION:
  - All authenticated endpoints require Authorization: Bearer <token> header
  - JWT tokens expire in 24 hours
  - Separate token systems for customers, sellers, and delivery partners

• DATA FORMATS:
  - All timestamps in ISO 8601 format (UTC)
  - Location coordinates in [longitude, latitude] format
  - All monetary amounts in INR (Indian Rupees)
  - Phone numbers are 10-digit Indian mobile numbers

• FILE UPLOADS:
  - Use multipart/form-data content type
  - Images stored on Cloudinary
  - Maximum file size: 5MB per imageignature" }

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