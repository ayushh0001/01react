# Google OAuth Setup Summary

## What Was Done

Google OAuth authentication has been configured to work on both:
- **Development:** `http://localhost:5173` and `http://localhost:5000`
- **Production:** `https://www.zpinshop.com`

## Changes Made

### Frontend Files Updated:
1. **Login.jsx** - Google login button now detects environment automatically
2. **Signup.jsx** - Google signup button now detects environment automatically
3. **api.js** - API base URL switches between dev and production automatically

### Backend Files Updated:
1. **backend/.env** - Added production configuration (commented out)
2. **backend/.env.example** - Created template with production notes

### Documentation Created:
1. **GOOGLE_OAUTH_PRODUCTION_SETUP.md** - Complete setup guide
2. **PRODUCTION_DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment checklist

## How It Works

### Development Mode (Current):
```javascript
// Frontend automatically uses:
Backend URL: http://localhost:5000
API calls: /api/v1/* (proxied by Vite)
Google OAuth: http://localhost:5000/api/v1/auth/google
```

### Production Mode (After Build):
```javascript
// Frontend automatically uses:
Backend URL: https://www.zpinshop.com
API calls: https://www.zpinshop.com/api/v1/*
Google OAuth: https://www.zpinshop.com/api/v1/auth/google
```

## Next Steps for Production

### 1. Google Cloud Console (REQUIRED)
Add these URLs to your OAuth 2.0 Client:

**Authorized Redirect URIs:**
- `https://www.zpinshop.com/api/v1/auth/google/callback`

**Authorized JavaScript Origins:**
- `https://www.zpinshop.com`

### 2. Backend Configuration
Update `backend/.env`:
```env
NODE_ENV=production
BASE_URL=https://www.zpinshop.com
FRONTEND_URL=https://www.zpinshop.com
GOOGLE_CALLBACK_URL=https://www.zpinshop.com/api/v1/auth/google/callback
ALLOWED_ORIGINS=https://www.zpinshop.com
```

### 3. Build and Deploy
```bash
# Build frontend
npm run build

# Deploy dist folder to web server
# Deploy backend with updated .env
```

## Testing

### Development (Works Now):
1. Run backend: `npm start` (in backend folder)
2. Run frontend: `npm run dev` (in root folder)
3. Visit: `http://localhost:5173`
4. Click "Continue with Google"
5. Should redirect through OAuth and back to dashboard

### Production (After Deployment):
1. Visit: `https://www.zpinshop.com`
2. Click "Continue with Google"
3. Should redirect through OAuth and back to dashboard

## Important Notes

- ✅ Frontend code automatically detects environment (no manual changes needed)
- ✅ Backend .env needs manual update for production
- ✅ Google Console needs both URLs added
- ✅ HTTPS is required for production OAuth
- ✅ .env file is properly excluded from Git

## Files to Review

- `docs/GOOGLE_OAUTH_PRODUCTION_SETUP.md` - Detailed setup guide
- `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Complete deployment checklist
- `backend/.env.example` - Template for environment variables

## Support

If you encounter issues during deployment, check:
1. Google Cloud Console configuration
2. Backend .env file settings
3. CORS configuration
4. SSL certificate validity
5. DNS settings for www.zpinshop.com
