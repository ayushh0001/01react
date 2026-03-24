# Settings Page - Database Integration Documentation

## Overview
The Settings page now fetches and displays seller profile data from the PostgreSQL database, including user information, business details, and bank details.

## Implementation Details

### Frontend Changes

#### File: `01react/src/Dashboard/Settings.jsx`

**Updated API Call:**
- Changed from: `GET /users/${userId}` (non-existent endpoint)
- Changed to: `GET /users/seller/profile` (authenticated endpoint)
- No longer requires userId in URL (extracted from JWT token)

**Data Mapping:**
```javascript
const data = response.data?.data || {};
const user = data.user || {};
const business = data.businessDetails || {};
const bank = data.bankDetails || {};
```

**Displayed Information:**

1. **Profile Section** (Top right)
   - Owner Name: `user.name`
   - Company: `business.businessName`

2. **Shop Information Card**
   - Shop Name: `business.businessName`
   - Shop Owner: `user.name`
   - Shop Address: `business.address`

3. **Contact Information Card**
   - Contact Number: `user.mobile`
   - Email Address: `user.email`

4. **Payment Details Card**
   - Bank Name: `bank.bankName`
   - Account Number: `bank.accountNumber` (masked: **** **** **** 1234)
   - IFSC Code: `bank.ifscCode`

### Backend Implementation

#### File: `01react/backend/Controller/sellerController.js`

**Function: `getSellerProfile`**
- Requires JWT authentication (via `authenticateToken` middleware)
- Extracts userId from `req.user.id` (set by middleware)
- Performs 3 database queries:
  1. Fetch user basic info from `users` table
  2. Fetch business details from `seller_business_details` table
  3. Fetch bank details from `seller_bank_details` table

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "userName": "testuser",
      "name": "Test User",
      "mobile": "1234567890",
      "email": "test@example.com",
      "userRole": "seller",
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "businessDetails": {
      "id": 1,
      "businessName": "Test Shop",
      "businessDescription": "A test shop",
      "businessType": "retail",
      "gstNo": "22AAAAA0000A1Z5",
      "panNo": "AAAAA0000A",
      "address": "123 Test Street",
      "city": "Test City",
      "state": "Test State",
      "pincode": "123456",
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "bankDetails": {
      "id": 1,
      "accountHolderName": "Test User",
      "accountNumber": "1234567890123456",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank of India",
      "branchName": "Test Branch",
      "accountType": "savings",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### File: `01react/backend/Routes/sellerRoutes.js`

**Route Definition:**
```javascript
router.get('/seller/profile', getSellerProfile);
```

- Full path: `GET /api/v1/users/seller/profile`
- Requires authentication (JWT token in Authorization header)
- Returns complete seller profile with all related data

### Database Tables Used

1. **users**
   - Columns: id, user_name, name, mobile, email, user_role, is_verified, created_at

2. **seller_business_details**
   - Columns: id, user_id, business_name, business_description, business_type, gst_no, pan_no, address, city, state, pincode, is_verified, created_at

3. **seller_bank_details**
   - Columns: id, user_id, account_holder_name, account_number, ifsc_code, bank_name, branch_name, account_type, created_at

## Authentication Flow

1. User logs in via Login.jsx or CreateAccount.jsx
2. JWT token is stored in localStorage as 'token'
3. API utility (`01react/src/utils/api.js`) automatically attaches token to all requests
4. Backend middleware (`authenticateToken`) verifies token and extracts userId
5. Controller uses userId to fetch related data from database

## Error Handling

**Frontend:**
- Displays "Could not load profile" if API call fails
- Shows "—" for missing data fields
- No redirects or alerts (graceful degradation)

**Backend:**
- Returns 404 if user not found
- Returns 500 for database errors
- Handles missing business/bank details (returns null)

## Testing

### Test Script: `01react/backend/Scripts/test_seller_profile.js`

**Usage:**
```bash
cd 01react/backend
node Scripts/test_seller_profile.js
```

**What it tests:**
1. Login with test credentials
2. Fetch seller profile using JWT token
3. Display formatted profile data
4. Verify response structure

**Prerequisites:**
- Backend server running on port 5000
- PostgreSQL database connected
- Test user exists (run `node Scripts/create_test_user.js`)
- User has completed business and bank details

## API Endpoint Summary

### GET /api/v1/users/seller/profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "businessDetails": { ... } or null,
    "bankDetails": { ... } or null
  }
}
```

**Error Responses:**

- **401 Unauthorized:** Missing or invalid token
- **404 Not Found:** User not found
- **500 Internal Server Error:** Database error

## Next Steps

1. ✅ Backend endpoint created (`getSellerProfile`)
2. ✅ Frontend updated to use correct endpoint
3. ✅ Data mapping implemented
4. ✅ Error handling added
5. ✅ Test script created

**To verify:**
1. Start backend server: `cd 01react/backend && npm run dev`
2. Start frontend: `cd 01react && npm run dev`
3. Login as a seller user
4. Navigate to Settings page
5. Verify all data displays correctly

## Files Modified

1. `01react/src/Dashboard/Settings.jsx` - Updated API call and data mapping
2. `01react/backend/Controller/sellerController.js` - Added getSellerProfile function
3. `01react/backend/Routes/sellerRoutes.js` - Added /seller/profile route
4. `01react/backend/Scripts/test_seller_profile.js` - Created test script

## Notes

- Account numbers are masked for security (shows only last 4 digits)
- Business and bank details may be null if not yet filled
- All fields show "N/A" if data is missing
- JWT token must be valid and not expired
- User must have 'seller' role to access this endpoint
