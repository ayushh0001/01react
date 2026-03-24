# Production Deployment Checklist for www.zpinshop.com

## Pre-Deployment Steps

### 1. Google Cloud Console Configuration
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Select your OAuth 2.0 Client ID
- [ ] Add Authorized Redirect URIs:
  - [ ] `https://www.zpinshop.com/api/v1/auth/google/callback`
- [ ] Add Authorized JavaScript Origins:
  - [ ] `https://www.zpinshop.com`
- [ ] Click "Save"

### 2. Backend Environment Configuration
- [ ] Update `backend/.env` file:
  ```env
  NODE_ENV=production
  BASE_URL=https://www.zpinshop.com
  FRONTEND_URL=https://www.zpinshop.com
  GOOGLE_CALLBACK_URL=https://www.zpinshop.com/api/v1/auth/google/callback
  ```
- [ ] Update CORS configuration:
  ```env
  ALLOWED_ORIGINS=https://www.zpinshop.com
  ```
- [ ] Verify database credentials are correct
- [ ] Verify all API keys are production keys (not test keys)

### 3. Frontend Build
- [ ] Run production build:
  ```bash
  cd 01react
  npm run build
  ```
- [ ] Verify build completes without errors
- [ ] Check `dist` folder is created

### 4. Backend Deployment
- [ ] Ensure PostgreSQL database is accessible from production server
- [ ] Ensure MinIO is accessible (or use production S3-compatible storage)
- [ ] Upload backend files to production server
- [ ] Install dependencies:
  ```bash
  npm install --production
  ```
- [ ] Start backend server:
  ```bash
  npm start
  ```
- [ ] Verify server is running on correct port

### 5. Frontend Deployment
- [ ] Upload `dist` folder contents to web server
- [ ] Configure web server (Nginx/Apache) to serve static files
- [ ] Set up SSL certificate (HTTPS is required for OAuth)
- [ ] Configure server to redirect all routes to index.html (for React Router)

### 6. DNS Configuration
- [ ] Verify www.zpinshop.com points to your server
- [ ] Verify SSL certificate is valid
- [ ] Test HTTPS connection

## Post-Deployment Testing

### 7. Test Google OAuth Flow
- [ ] Visit https://www.zpinshop.com
- [ ] Click "Continue with Google" on login page
- [ ] Verify redirect to Google consent screen
- [ ] Approve consent
- [ ] Verify redirect back to your site
- [ ] Verify token is saved in localStorage
- [ ] Verify redirect to dashboard

### 8. Test Signup Flow
- [ ] Click "Sign up with Google"
- [ ] Complete OAuth flow
- [ ] Verify new user is created in database
- [ ] Verify redirect to appropriate page based on role

### 9. Test API Endpoints
- [ ] Test login endpoint: `POST /api/v1/auth/login`
- [ ] Test signup endpoint: `POST /api/v1/auth/signup`
- [ ] Test protected endpoints with JWT token
- [ ] Test OTP sending and verification
- [ ] Test business details submission
- [ ] Test settings page data fetch

### 10. Test Error Handling
- [ ] Test invalid credentials
- [ ] Test expired tokens
- [ ] Test network errors
- [ ] Verify error page displays correctly
- [ ] Test 404 page

## Security Checklist

### 11. Security Verification
- [ ] Verify `.env` file is NOT in Git repository
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify HTTPS is enforced (no HTTP access)
- [ ] Verify CORS is configured correctly
- [ ] Verify JWT secrets are strong and unique
- [ ] Verify database credentials are secure
- [ ] Verify API keys are production keys
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring and logging

## Monitoring Setup

### 12. Set Up Monitoring
- [ ] Set up error logging (e.g., Sentry, LogRocket)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Set up database backup schedule
- [ ] Set up alerts for critical errors

## Rollback Plan

### 13. Prepare Rollback
- [ ] Document current working version
- [ ] Keep backup of previous deployment
- [ ] Document rollback procedure
- [ ] Test rollback procedure

## Common Issues and Solutions

### OAuth redirect_uri_mismatch
**Problem:** Google shows "redirect_uri_mismatch" error

**Solution:**
1. Check Google Console Authorized Redirect URIs
2. Ensure exact match with GOOGLE_CALLBACK_URL in .env
3. No trailing slashes
4. Correct protocol (https)

### CORS Errors
**Problem:** Browser shows CORS errors

**Solution:**
1. Update ALLOWED_ORIGINS in backend .env
2. Ensure backend CORS middleware is configured
3. Restart backend server

### Token Not Saved
**Problem:** User redirected but not logged in

**Solution:**
1. Check browser console for errors
2. Verify AuthCallback.jsx receives token parameter
3. Check localStorage in DevTools
4. Verify JWT is valid

### 404 on Refresh
**Problem:** Page refresh shows 404 error

**Solution:**
1. Configure web server to redirect all routes to index.html
2. For Nginx:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## Environment Variables Reference

### Required for Production:
```env
# Database
DB_HOST=your_production_db_host
DB_PASSWORD=your_secure_password

# Server
NODE_ENV=production
BASE_URL=https://www.zpinshop.com
FRONTEND_URL=https://www.zpinshop.com

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://www.zpinshop.com/api/v1/auth/google/callback

# JWT
JWT_SECRET=your_strong_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# CORS
ALLOWED_ORIGINS=https://www.zpinshop.com
```

## Support Contacts

- Google OAuth Issues: Check [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Twilio Issues: Check [Twilio Documentation](https://www.twilio.com/docs)
- Database Issues: Check PostgreSQL logs

## Notes

- Always test in staging environment before production
- Keep development and production credentials separate
- Never commit sensitive credentials to Git
- Rotate secrets regularly
- Monitor logs for suspicious activity
