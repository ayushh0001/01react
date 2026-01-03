# ZPIN Login Process Documentation

## Overview
The ZPIN application implements a multi-step user authentication and onboarding process. This document explains how the login and registration flow works.

## Login Flow Components

### 1. **Home.jsx** - Landing Page
- **Purpose**: Entry point with login/signup buttons
- **Navigation**: 
  - Login button → `/login`
  - Signup button → `/signup`

### 2. **Login.jsx** - User Authentication
- **Purpose**: Authenticate existing users
- **Process**:
  1. User enters username/email and password
  2. Form validation (both fields required)
  3. Simulated API call (1 second delay)
  4. Success → Redirect to `/dashboard`
  5. Error → Display error message
- **Features**: Loading state, alert notifications, "Forgot password" link

### 3. **Signup.jsx** - Initial Registration
- **Purpose**: Capture username/email for new users
- **Process**:
  1. User enters username or email
  2. Validation (field required)
  3. Success → Redirect to `/phone` for verification
- **Next Step**: Phone number verification

## Registration Flow (New Users)

### Step 1: **PhoneNumberVerification.jsx**
- **Purpose**: Verify user's phone number via OTP
- **Process**:
  1. Enter 10-digit phone number
  2. Send OTP (simulated)
  3. Enter 4-digit OTP code
  4. Verification success → Redirect to `/create-account`

### Step 2: **CreateAccount.jsx**
- **Purpose**: Create user account with credentials
- **Process**:
  1. Enter full name, email, password, confirm password
  2. Validation (email format, password match, minimum length)
  3. Success → Redirect to `/details`

### Step 3: **Details.jsx**
- **Purpose**: Collect business information
- **Process**:
  1. Enter display name, pickup pincode, business description
  2. Validation (6-digit pincode)
  3. Success → Redirect to `/gst-details`

### Step 4: **GSTDetails.jsx**
- **Purpose**: Collect tax information
- **Process**:
  1. Enter GST number, business type, registered name, PAN
  2. Validation (GST format, PAN format)
  3. Success → Redirect to `/bank`

### Step 5: **BankDetails.jsx**
- **Purpose**: Collect banking information
- **Process**:
  1. Enter account details, IFSC, bank info
  2. Validation (account number match, IFSC format)
  3. Success → Redirect to `/` (home/dashboard)

## Key Features

### Validation System
- **Real-time validation** for all form fields
- **Format checking** (email, phone, GST, PAN, IFSC)
- **Field matching** (password confirmation, account numbers)

### User Experience
- **Loading states** during form submission
- **Alert notifications** for success/error messages
- **Auto-redirect** after successful operations
- **Input restrictions** (digits only for phone/pincode)

### Navigation Flow
```
Home → Login → Dashboard (existing users)
  ↓
Home → Signup → Phone → Account → Details → GST → Bank → Dashboard (new users)
```

## Technical Implementation

### State Management
- **useState** for form data, loading states, and messages
- **useNavigate** for programmatic routing

### Form Handling
- **Controlled components** with onChange handlers
- **Form validation** before submission
- **Error handling** with user-friendly messages

### Security Features
- **Input sanitization** (remove non-digits for numeric fields)
- **Format validation** using regex patterns
- **Required field validation** before submission

## File Structure
```
Log-process/
├── Home.jsx           # Landing page
├── Login.jsx          # User authentication
├── Signup.jsx         # Initial registration
├── PhoneNumberVerification.jsx  # OTP verification
├── CreateAccount.jsx  # Account creation
├── Details.jsx        # Business details
├── GSTDetails.jsx     # Tax information
└── BankDetails.jsx    # Banking information
```

This documentation provides a complete overview of how users authenticate and register in the ZPIN platform.