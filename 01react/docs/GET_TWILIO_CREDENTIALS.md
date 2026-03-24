# Get Your Twilio Trial Credentials - Quick Guide

## You Need 3 Things:

### 1. Account SID
- Go to Twilio Dashboard (click Twilio logo top-left)
- Look for "Account Info" section
- Copy the **Account SID** (starts with `AC...`)
- Example: `AC1234567890abcdef1234567890abcdef`

### 2. Auth Token
- Same "Account Info" section
- Click the **eye icon** next to Auth Token to reveal it
- Copy the **Auth Token**
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 3. Phone Number
- Click **"Buy a new Twilio Number"** (or go to Phone Numbers → Buy a number)
- Select **Country**: United States
- Make sure **SMS** is checked
- Click **Search**
- Click **Buy** on any number (FREE for trial)
- Copy the number with country code
- Example: `+12345678900`

## Then Run:

```powershell
node backend/Scripts/setup_twilio.js
```

Enter the 3 values when prompted.

## Important for Trial Mode:

You can only send SMS to **verified phone numbers**.

### Verify Your Phone Number:
1. Go to: https://console.twilio.com/phone-numbers/verified
2. Click **"Add a new Caller ID"**
3. Enter your Indian mobile: `+919876543210`
4. Verify via SMS or call
5. Now you can send OTP to this number!

## Alternative: Test Without Twilio First

If you want to test the flow without setting up Twilio:

1. **Skip Twilio setup**
2. **Just restart server**: `npm run server:dev`
3. **Test at**: http://localhost:5173/phone
4. **OTP will show in backend console** (no SMS sent)

This is perfect for testing the flow before adding real SMS!
