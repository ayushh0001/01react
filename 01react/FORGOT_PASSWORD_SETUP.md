# Forgot Password Setup - Quick Start Guide

## ✅ What's Been Implemented

Complete forgot password functionality with OTP verification via SMS:
- Request password reset by mobile number
- Receive 6-digit OTP via Twilio SMS
- Verify OTP (10-minute expiration)
- Reset password securely
- Rate limiting and security features

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Migration

Choose one option:

**Option A: Using Node.js script (Recommended)**
```bash
cd 01react/backend
node Scripts/run_password_reset_migration.js
```

**Option B: Using psql command**
```bash
psql -U postgres -d zpin_ecommerce -f 01react/backend/Scripts/add_password_reset_table.sql
```

**Option C: Using pgAdmin or any PostgreSQL client**
- Open `01react/backend/Scripts/add_password_reset_table.sql`
- Execute the SQL script

### Step 2: Verify Twilio Configuration

Check your `01react/backend/.env` file has:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NODE_ENV=development  # or production
```

### Step 3: Test the Flow

1. Start backend: `cd 01react/backend && npm run server`
2. Start frontend: `cd 01react && npm run dev`
3. Go to login page
4. Click "Forgot password?"
5. Enter mobile number
6. Check SMS for OTP (or console in dev mode)
7. Enter OTP
8. Set new password
9. Login with new password

## 📁 Files Created

### Backend
- `01react/backend/Routes/passwordResetRoutes.js` - API routes
- `01react/backend/Controller/passwordResetController.js` - Business logic
- `01react/backend/Scripts/add_password_reset_table.sql` - Database migration
- `01react/backend/Scripts/run_password_reset_migration.js` - Migration runner

### Frontend
- `01react/src/Log-process/ForgotPassword.jsx` - Request OTP page
- `01react/src/Log-process/VerifyResetOTP.jsx` - Verify OTP page
- `01react/src/Log-process/ResetPassword.jsx` - Reset password page

### Documentation
- `01react/docs/FORGOT_PASSWORD_IMPLEMENTATION.md` - Complete documentation

## 🔧 API Endpoints

All endpoints are under `/api/v1/password-reset`:

- `POST /request` - Send OTP to mobile
- `POST /verify-otp` - Verify OTP code
- `POST /reset` - Reset password
- `POST /resend-otp` - Resend OTP

## 🎨 User Flow

```
Login Page
    ↓ (Click "Forgot password?")
Forgot Password Page (Enter mobile)
    ↓ (OTP sent via SMS)
Verify OTP Page (Enter 6-digit code)
    ↓ (OTP verified)
Reset Password Page (Enter new password)
    ↓ (Password reset)
Login Page (Login with new password)
```

## 🔒 Security Features

- ✅ OTP expires after 10 minutes
- ✅ Rate limiting (max 3 OTPs per 10 minutes)
- ✅ One-time use tokens
- ✅ Password hashing with bcrypt
- ✅ Token validation
- ✅ Secure SMS delivery via Twilio

## 🧪 Development Mode

When Twilio is unavailable:
- OTP is shown in API response
- OTP is displayed in UI
- Perfect for testing without SMS costs

## ❓ Troubleshooting

**Migration fails:**
- Check PostgreSQL is running
- Verify database name is `zpin_ecommerce`
- Check user has CREATE TABLE permissions

**OTP not received:**
- Check Twilio credentials in `.env`
- Verify Twilio account balance
- Check phone number format (10 digits)
- Look for OTP in console (dev mode)

**"No account found" error:**
- User must be registered first
- Mobile number must match registration

## 📚 Full Documentation

See `01react/docs/FORGOT_PASSWORD_IMPLEMENTATION.md` for:
- Detailed API documentation
- Security considerations
- Production deployment guide
- Database schema details
- Error handling guide

## ✨ Ready to Use!

After running the migration, the forgot password feature is fully functional and ready for testing.
