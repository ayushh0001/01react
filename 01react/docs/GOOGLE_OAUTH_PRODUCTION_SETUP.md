# Google OAuth Production Setup Guide

## Overview
This guide explains how to configure Google OAuth to work on both localhost (development) and www.zpinshop.com (production).

## Current Configuration

### Environment Variables
The `.env` file contains configuration for both environments:

**Development (default):**
```env
NODE_ENV=development
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

**Production (uncomment when deploying):**
```env
NODE_ENV=production
BASE_URL=https://www.zpinshop.com
FRONTEND_URL=https://www.zpinshop.com
GOOGLE_CALLBACK_URL=https://www.zpinshop.com/api/v1/auth/google/callback
```

## Google Cloud Console Setup

### Step 1: Add Authorized Redirect URIs
You need to add BOTH URLs to your Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   - `http://localhost:5000/api/v1/auth/google/callback` (for development)
   - `https://www.zpinshop.com/api/v1/auth/google/callback` (for production)
5. Click "Save"

### Step 2: Add Authorized JavaScript Origins
Add these origins to allow the frontend to initiate OAuth:

1. In the same OAuth client configuration
2. Under "Authorized JavaScript origins", add:
   - `http://localhost:5173` (for development frontend)
   - `https://www.zpinshop.com` (for production frontend)
3. Click "Save"

## Frontend Configuration

### Login.jsx and Signup.jsx
Both files now automatically detect the environment:

```javascript
const handleGoogleLogin = () => {
  // Determine the backend URL based on environment
  const backendUrl = import.meta.env.PROD 
    ? 'https://www.zpinshop.com'  // Production backend
    : 'http://localhost:5000';     // Development backend
  
  window.location.href = `${backendUrl}/api/v1/auth/google`;
};
```

### API Configuration (api.js)
The API utility automatically switches between development and production:

```javascript
const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return 'https://www.zpinshop.com/api/v1';  // Production
  }
  return '/api/v1';  // Development (uses Vite proxy)
};
```

## Deployment Checklist

### For Production Deployment:

1. **Update Backend .env file:**
   ```bash
   # Comment out development settings
   # NODE_ENV=development
   # BASE_URL=http://localhost:5000
   # FRONTEND_URL=http://localhost:5173
   # GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
   
   # Uncomment production settings
   NODE_ENV=production
   BASE_URL=https://www.zpinshop.com
   FRONTEND_URL=https://www.zpinshop.com
   GOOGLE_CALLBACK_URL=https://www.zpinshop.com/api/v1/auth/google/callback
   ```

2. **Verify Google Cloud Console:**
   - Ensure both redirect URIs are added
   - Ensure both JavaScript origins are added
   - OAuth consent screen is configured

3. **Build Frontend:**
   ```bash
   npm run build
   ```

4. **Deploy Backend:**
   - Ensure environment variables are set correctly
   - Restart the backend server

5. **Test OAuth Flow:**
   - Visit https://www.zpinshop.com
   - Click "Continue with Google" or "Sign up with Google"
   - Complete OAuth flow
   - Verify redirect back to dashboard

## OAuth Flow

### Development Flow:
1. User clicks "Continue with Google" on `http://localhost:5173`
2. Redirects to `http://localhost:5000/api/v1/auth/google`
3. Backend redirects to Google OAuth consent screen
4. User approves
5. Google redirects to `http://localhost:5000/api/v1/auth/google/callback`
6. Backend processes auth and redirects to `http://localhost:5173/auth/callback?token=...`
7. Frontend saves token and redirects to dashboard

### Production Flow:
1. User clicks "Continue with Google" on `https://www.zpinshop.com`
2. Redirects to `https://www.zpinshop.com/api/v1/auth/google`
3. Backend redirects to Google OAuth consent screen
4. User approves
5. Google redirects to `https://www.zpinshop.com/api/v1/auth/google/callback`
6. Backend processes auth and redirects to `https://www.zpinshop.com/auth/callback?token=...`
7. Frontend saves token and redirects to dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Console exactly matches the one in your .env
- Ensure there are no trailing slashes
- Verify the protocol (http vs https)

### Error: "origin_mismatch"
- Check that JavaScript origins are added in Google Console
- Ensure the frontend URL matches exactly

### Token Not Saved
- Check browser console for errors
- Verify AuthCallback.jsx is receiving token parameter
- Check localStorage in browser DevTools

### CORS Errors in Production
- Ensure backend CORS is configured to allow www.zpinshop.com
- Check ALLOWED_ORIGINS in .env file

## Security Notes

1. **Never commit .env file** - It contains sensitive credentials
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Rotate secrets regularly** - Change OAuth credentials periodically
4. **Monitor OAuth usage** - Check Google Cloud Console for suspicious activity

## Files Modified

- `01react/backend/.env` - Added production configuration
- `01react/src/Log-process/Login.jsx` - Dynamic backend URL
- `01react/src/Log-process/Signup.jsx` - Dynamic backend URL
- `01react/src/utils/api.js` - Environment-aware base URL
- `01react/.gitignore` - Properly excludes .env files

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for OAuth errors
3. Verify Google Cloud Console configuration
4. Ensure environment variables are set correctly
