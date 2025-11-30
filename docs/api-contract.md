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