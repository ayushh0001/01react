# Google Cloud Console Configuration Guide

## Step-by-Step Instructions

### Step 1: Access Google Cloud Console
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Navigate to Credentials
1. Click on the hamburger menu (☰) in the top-left
2. Navigate to: **APIs & Services** → **Credentials**
3. You should see your existing OAuth 2.0 Client ID

### Step 3: Edit OAuth Client
1. Click on your OAuth 2.0 Client ID name
2. You'll see the configuration page

### Step 4: Add Authorized JavaScript Origins

**Current Origins (Development):**
```
http://localhost:5173
```

**Add Production Origin:**
```
https://www.zpinshop.com
```

**Final List Should Include:**
- `http://localhost:5173` (for development)
- `https://www.zpinshop.com` (for production)

### Step 5: Add Authorized Redirect URIs

**Current Redirect URI (Development):**
```
http://localhost:5000/api/v1/auth/google/callback
```

**Add Production Redirect URI:**
```
https://www.zpinshop.com/api/v1/auth/google/callback
```

**Final List Should Include:**
- `http://localhost:5000/api/v1/auth/google/callback` (for development)
- `https://www.zpinshop.com/api/v1/auth/google/callback` (for production)

### Step 6: Save Changes
1. Click the **"Save"** button at the bottom
2. Wait for confirmation message

## Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│ Edit OAuth 2.0 Client                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name: [Your OAuth Client Name]                             │
│                                                             │
│ Client ID: 736340596721-8sp5fs6l2cv596tlmqipa9b5ibfguvu7  │
│                                                             │
│ Client Secret: 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        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Authorized JavaScript origins                               │
├─────────────────────────────────────────────────────────────┤
│ URIs 1  http://localhost:5173                    [Remove]  │
│ URIs 2  https://www.zpinshop.com                 [Remove]  │
│                                                             │
│ [+ ADD URI]                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Authorized redirect URIs                                    │
├─────────────────────────────────────────────────────────────┤
│ URIs 1  http://localhost:5000/api/v1/auth/google/callback  │
│                                                   [Remove]  │
│ URIs 2  https://www.zpinshop.com/api/v1/auth/google/callback│
│                                                   [Remove]  │
│                                                             │
│ [+ ADD URI]                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                    [CANCEL]  [SAVE]         │
└─────────────────────────────────────────────────────────────┘
```

## Important Notes

### URL Format Rules:
- ✅ Use exact URLs (no wildcards)
- ✅ Include protocol (http:// or https://)
- ✅ No trailing slashes
- ✅ Port numbers are allowed for localhost
- ❌ Don't use wildcards (*.zpinshop.com won't work)
- ❌ Don't add query parameters or fragments

### Common Mistakes:
1. **Trailing Slash:** 
   - ❌ `https://www.zpinshop.com/`
   - ✅ `https://www.zpinshop.com`

2. **Wrong Protocol:**
   - ❌ `http://www.zpinshop.com` (production must use HTTPS)
   - ✅ `https://www.zpinshop.com`

3. **Missing /api/v1/auth/google/callback:**
   - ❌ `https://www.zpinshop.com`
   - ✅ `https://www.zpinshop.com/api/v1/auth/google/callback`

4. **Subdomain Mismatch:**
   - ❌ `https://zpinshop.com` (missing www)
   - ✅ `https://www.zpinshop.com`

## Verification

After saving, verify your configuration:

### Check Authorized JavaScript Origins:
```
✓ http://localhost:5173
✓ https://www.zpinshop.com
```

### Check Authorized Redirect URIs:
```
✓ http://localhost:5000/api/v1/auth/google/callback
✓ https://www.zpinshop.com/api/v1/auth/google/callback
```

## Testing

### Test Development (Should Work Now):
1. Visit: `http://localhost:5173`
2. Click "Continue with Google"
3. Should redirect to Google consent screen
4. After approval, should redirect back to your app

### Test Production (After Deployment):
1. Visit: `https://www.zpinshop.com`
2. Click "Continue with Google"
3. Should redirect to Google consent screen
4. After approval, should redirect back to your app

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause:** The redirect URI doesn't match what's in Google Console

**Solution:**
1. Check the error message for the exact URI being used
2. Copy that exact URI
3. Add it to Authorized Redirect URIs in Google Console
4. Make sure there are no typos or extra characters

### Error: "origin_mismatch"
**Cause:** The JavaScript origin doesn't match what's in Google Console

**Solution:**
1. Check your frontend URL
2. Add the exact URL to Authorized JavaScript Origins
3. Make sure protocol (http/https) matches

### Error: "invalid_client"
**Cause:** Client ID or Secret is incorrect

**Solution:**
1. Verify GOOGLE_CLIENT_ID in your .env file
2. Verify GOOGLE_CLIENT_SECRET in your .env file
3. Make sure they match what's shown in Google Console

## OAuth Consent Screen

If you haven't configured the OAuth consent screen:

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public access)
3. Fill in required fields:
   - App name: "Zpin E-Commerce"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users (if in testing mode)
6. Save and continue

## Publishing Your App

For production use, you may need to verify your app:

1. Complete the OAuth consent screen configuration
2. Submit for verification (if required)
3. Wait for Google's approval
4. Once approved, any Google user can sign in

**Note:** During development/testing, you can add specific test users without verification.

## Security Best Practices

1. ✅ Keep Client Secret confidential
2. ✅ Never commit .env file to Git
3. ✅ Use HTTPS in production
4. ✅ Regularly rotate secrets
5. ✅ Monitor OAuth usage in Google Console
6. ✅ Set up alerts for suspicious activity

## Support Links

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com)
