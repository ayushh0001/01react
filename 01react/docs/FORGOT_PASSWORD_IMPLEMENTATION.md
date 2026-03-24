# Forgot Password Implementation

## Overview
Complete forgot password functionality has been implemented with OTP verification via Twilio SMS.

## Features
- Request password reset via mobile number
- OTP sent via Twilio SMS (6-digit code)
- OTP verification with 10-minute expiration
- Secure password reset with token validation
- Rate limiting (max 3 OTPs per 10 minutes)
- Resend OTP functionality
- Development mode fallback (returns OTP in response when Twilio unavailable)

## Database Setup

### Run Migration
You need to run the database migration to create the `password_reset_tokens` table:

```bash
# Option 1: Using psql command line
psql -U postgres -d zpin_ecommerce -f 01react/backend/Scripts/add_password_reset_table.sql

# Option 2: Using pgAdmin or any PostgreSQL client
# Open and execute the SQL file: 01react/backend/Scripts/add_password_reset_table.sql
```

### Database Schema
The migration creates:
- `password_reset_tokens` table with columns:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to users table)
  - `email` (VARCHAR)
  - `otp` (VARCHAR, 6-digit code)
  - `expires_at` (TIMESTAMP, 10 minutes from creation)
  - `is_used` (BOOLEAN, prevents OTP reuse)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Indexes for faster lookups on email, otp, and expires_at
- Trigger to auto-update `updated_at` timestamp
- Cleanup function to remove expired tokens

## Backend Implementation

### Routes (`01react/backend/Routes/passwordResetRoutes.js`)
- `POST /api/v1/password-reset/request` - Request password reset (send OTP)
- `POST /api/v1/password-reset/verify-otp` - Verify OTP code
- `POST /api/v1/password-reset/reset` - Reset password with verified token
- `POST /api/v1/password-reset/resend-otp` - Resend OTP if expired

### Controller (`01react/backend/Controller/passwordResetController.js`)
Implements all password reset logic:
- OTP generation (6-digit random number)
- Twilio SMS integration
- OTP verification and validation
- Password hashing with bcrypt
- Token management and cleanup
- Rate limiting checks

### Server Integration
Routes are registered in `01react/backend/server.js`:
```javascript
import passwordResetRoutes from './Routes/passwordResetRoutes.js';
app.use('/api/v1/password-reset', passwordResetRoutes);
```

## Frontend Implementation

### Pages Created
1. **ForgotPassword.jsx** (`01react/src/Log-process/ForgotPassword.jsx`)
   - Enter mobile number
   - Request OTP
   - Navigate to OTP verification

2. **VerifyResetOTP.jsx** (`01react/src/Log-process/VerifyResetOTP.jsx`)
   - Enter 6-digit OTP
   - 10-minute countdown timer
   - Resend OTP functionality (after 1 minute)
   - Development mode shows OTP in UI

3. **ResetPassword.jsx** (`01react/src/Log-process/ResetPassword.jsx`)
   - Enter new password
   - Confirm password
   - Password strength validation (min 6 characters)
   - Show/hide password toggle

### Routes Added to App.jsx
```javascript
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

### Login Page Integration
The Login page already has a "Forgot password?" link that navigates to `/forgot-password`.

## User Flow

1. **Request Reset**
   - User clicks "Forgot password?" on login page
   - Enters mobile number
   - Clicks "Send OTP"
   - Backend sends 6-digit OTP via Twilio SMS

2. **Verify OTP**
   - User enters OTP received via SMS
   - 10-minute countdown timer displayed
   - Can resend OTP after 1 minute
   - Backend verifies OTP and marks as used
   - Returns reset token

3. **Reset Password**
   - User enters new password (min 6 characters)
   - Confirms password
   - Backend validates token and updates password
   - Redirects to login page with success message

## Security Features

### Rate Limiting
- Maximum 3 OTP requests per 10 minutes per user
- Prevents OTP spam attacks

### OTP Expiration
- OTPs expire after 10 minutes
- Expired OTPs cannot be used

### Token Validation
- Reset token must be verified (OTP marked as used)
- Token expires 30 minutes after OTP verification
- One-time use tokens (deleted after password reset)

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt (10 salt rounds)

## Development Mode

When Twilio is unavailable or in development:
- OTP is returned in API response
- Displayed in UI for easy testing
- Set `NODE_ENV=development` in `.env`

Example response:
```json
{
  "success": true,
  "message": "OTP generated (Twilio unavailable in dev)",
  "mobile": "1234567890",
  "otp": "123456",
  "expiresIn": 600
}
```

## Environment Variables

Required in `01react/backend/.env`:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Environment
NODE_ENV=development  # or production
```

## Testing

### Manual Testing Flow
1. Start backend server: `npm run server` (in backend directory)
2. Start frontend: `npm run dev` (in root directory)
3. Navigate to login page
4. Click "Forgot password?"
5. Enter mobile number (use test number if in dev mode)
6. Check console/SMS for OTP
7. Enter OTP and verify
8. Set new password
9. Login with new password

### Test Endpoints with curl

**Request OTP:**
```bash
curl -X POST http://localhost:5000/api/v1/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"mobile":"1234567890"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/v1/password-reset/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"1234567890","otp":"123456"}'
```

**Reset Password:**
```bash
curl -X POST http://localhost:5000/api/v1/password-reset/reset \
  -H "Content-Type: application/json" \
  -d '{"mobile":"1234567890","resetToken":"token-from-verify","newPassword":"newpass123"}'
```

## Error Handling

### Common Errors
- **"No account found with this mobile number"** - User doesn't exist
- **"Invalid OTP"** - Wrong OTP entered
- **"OTP has expired"** - OTP older than 10 minutes
- **"OTP has already been used"** - Trying to reuse verified OTP
- **"Too many OTP requests"** - Rate limit exceeded (3 per 10 min)
- **"Password must be at least 6 characters long"** - Weak password
- **"Invalid or expired reset token"** - Token validation failed

## UI/UX Features

### Visual Design
- Gradient backgrounds (amber/yellow/orange theme)
- Icon-based headers for each step
- Color-coded alerts (red for errors, green for success)
- Responsive design (mobile-first)
- Loading states with spinners
- Smooth transitions and animations

### User Feedback
- Real-time countdown timer
- Clear error messages
- Success confirmations
- Auto-redirect after success
- Disabled states during loading
- Password visibility toggle

## Database Cleanup

Optional: Set up a cron job to clean expired tokens:
```sql
-- Run periodically (e.g., daily)
SELECT cleanup_expired_password_reset_tokens();
```

Or manually:
```sql
DELETE FROM password_reset_tokens
WHERE expires_at < CURRENT_TIMESTAMP
OR (is_used = TRUE AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours');
```

## Files Modified/Created

### Backend
- ✅ Created: `01react/backend/Routes/passwordResetRoutes.js`
- ✅ Created: `01react/backend/Controller/passwordResetController.js`
- ✅ Created: `01react/backend/Scripts/add_password_reset_table.sql`
- ✅ Modified: `01react/backend/server.js` (added password reset routes)

### Frontend
- ✅ Created: `01react/src/Log-process/ForgotPassword.jsx`
- ✅ Created: `01react/src/Log-process/VerifyResetOTP.jsx`
- ✅ Created: `01react/src/Log-process/ResetPassword.jsx`
- ✅ Modified: `01react/src/App.jsx` (added routes)
- ✅ Existing: `01react/src/Log-process/Login.jsx` (already has forgot password link)

### Documentation
- ✅ Created: `01react/docs/FORGOT_PASSWORD_IMPLEMENTATION.md`

## Next Steps

1. **Run Database Migration** (REQUIRED)
   ```bash
   psql -U postgres -d zpin_ecommerce -f 01react/backend/Scripts/add_password_reset_table.sql
   ```

2. **Configure Twilio** (if not already done)
   - Add credentials to `.env`
   - Test SMS delivery

3. **Test Complete Flow**
   - Request OTP
   - Verify OTP
   - Reset password
   - Login with new password

4. **Optional: Set up token cleanup cron job**

## Production Considerations

- Ensure Twilio credentials are properly configured
- Set `NODE_ENV=production` in production environment
- Monitor OTP delivery success rates
- Set up alerts for rate limit violations
- Consider adding CAPTCHA to prevent automated attacks
- Implement IP-based rate limiting for additional security
- Log all password reset attempts for security auditing

## Support

For issues or questions:
- Check backend logs for detailed error messages
- Verify Twilio configuration and balance
- Ensure database migration was run successfully
- Test with development mode first before production
