# Production Database & Backend Deployment Guide

## 📊 Your Current Configuration

### Database
- **Database Name:** `zpin_ecommerce`
- **Database Port:** `5432` (PostgreSQL default)
- **Current Location:** localhost (your local machine)

### Backend
- **Backend Port:** `5000`
- **Current Location:** localhost (your local machine)

### Frontend
- **Deployment:** Vercel (Public - ✅ Already deployed)
- **URL:** www.zpinshop.com

## ⚠️ The Problem

Your frontend is deployed on Vercel (public), but:
- ❌ Database is on localhost (not accessible from internet)
- ❌ Backend is on localhost (not accessible from internet)
- ❌ MinIO is on localhost (not accessible from internet)

**Result:** Your public website cannot connect to your local database and backend!

## ✅ Solution: Deploy Backend & Database to Cloud

You need to deploy your backend and database to a cloud service. Here are your options:

---

## Option 1: Render.com (Recommended - Free Tier Available)

### Why Render?
- ✅ Free PostgreSQL database (90 days, then $7/month)
- ✅ Free backend hosting (with limitations)
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Good for small to medium projects

### Steps:

#### 1. Deploy PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name:** `zpin-ecommerce-db`
   - **Database:** `zpin_ecommerce`
   - **User:** (auto-generated)
   - **Region:** Choose closest to your users
   - **Plan:** Free (or Starter $7/month for production)
4. Click "Create Database"
5. **Save these credentials:**
   - Internal Database URL (for backend)
   - External Database URL (for local access)
   - Host, Port, Database, Username, Password

#### 2. Migrate Your Local Database to Render

```bash
# Export your local database
pg_dump -U postgres -d zpin_ecommerce -f zpin_backup.sql

# Import to Render (use External Database URL from Render)
psql -h <render-host> -U <render-user> -d zpin_ecommerce -f zpin_backup.sql
```

Or use a GUI tool like pgAdmin:
1. Connect to Render database using External URL
2. Right-click → Restore
3. Select your backup file

#### 3. Deploy Backend on Render

1. Push your code to GitHub (if not already)
2. On Render, click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `zpin-backend`
   - **Root Directory:** `01react/backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server` or `node server.js`
   - **Plan:** Free (or Starter $7/month)
5. Add Environment Variables (copy from your `.env`):
   ```
   DB_HOST=<render-database-host>
   DB_PORT=5432
   DB_NAME=zpin_ecommerce
   DB_USER=<render-database-user>
   DB_PASSWORD=<render-database-password>
   PORT=5000
   NODE_ENV=production
   BASE_URL=https://zpin-backend.onrender.com
   FRONTEND_URL=https://www.zpinshop.com
   ALLOWED_ORIGINS=https://www.zpinshop.com
   JWT_SECRET=<your-jwt-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CALLBACK_URL=https://zpin-backend.onrender.com/api/v1/auth/google/callback
   TWILIO_ACCOUNT_SID=<your-twilio-sid>
   TWILIO_AUTH_TOKEN=<your-twilio-token>
   TWILIO_PHONE_NUMBER=<your-twilio-number>
   ```
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Your backend URL will be: `https://zpin-backend.onrender.com`

#### 4. Deploy MinIO (Object Storage)

**Option A: Use Render Disk Storage**
- Render provides persistent disk storage
- Add disk in Render dashboard
- Update MinIO config to use disk path

**Option B: Use AWS S3 or Cloudflare R2**
- More reliable for production
- See "MinIO Alternative" section below

#### 5. Update Frontend Environment Variables on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   ```
   VITE_API_URL=https://zpin-backend.onrender.com/api/v1
   VITE_BACKEND_URL=https://zpin-backend.onrender.com
   ```
3. Redeploy your frontend

---

## Option 2: Railway.app (Easy & Fast)

### Why Railway?
- ✅ Very easy setup
- ✅ PostgreSQL included
- ✅ $5 free credit monthly
- ✅ Fast deployment
- ✅ Good developer experience

### Steps:

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy PostgreSQL"
3. Click "New" → "GitHub Repo" → Select your repository
4. Add environment variables (same as Render)
5. Railway will auto-detect Node.js and deploy
6. Get your backend URL from Railway dashboard
7. Update Vercel environment variables

---

## Option 3: DigitalOcean App Platform

### Why DigitalOcean?
- ✅ Reliable infrastructure
- ✅ Managed PostgreSQL
- ✅ $200 free credit for 60 days (new users)
- ✅ Good for scaling

### Pricing:
- Database: $15/month (Basic)
- Backend: $5/month (Basic)

### Steps:

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create Managed PostgreSQL Database
3. Create App → Connect GitHub → Deploy
4. Configure environment variables
5. Update Vercel with new backend URL

---

## Option 4: AWS (Most Scalable, Complex)

### Services Needed:
- **RDS** (PostgreSQL database)
- **EC2** or **Elastic Beanstalk** (Backend)
- **S3** (File storage instead of MinIO)

### Pricing:
- RDS: ~$15-30/month
- EC2: ~$5-10/month
- S3: Pay per use (~$1-5/month)

**Note:** AWS is more complex but best for large-scale production.

---

## MinIO Alternative: Use Cloud Storage

Since MinIO is hard to deploy, consider these alternatives:

### Option A: AWS S3
```javascript
// Install AWS SDK
npm install @aws-sdk/client-s3

// Update productController.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
```

### Option B: Cloudflare R2 (Cheaper than S3)
- S3-compatible API
- No egress fees
- $0.015/GB storage
- Free tier: 10GB storage

### Option C: Supabase Storage (Free tier available)
- Built-in PostgreSQL + Storage
- Easy to use
- Good free tier

---

## Quick Start: Recommended Setup for Your Project

### For Development/Testing (Current):
- ✅ Frontend: Vercel
- ✅ Backend: localhost:5000
- ✅ Database: localhost:5432
- ✅ Storage: localhost MinIO

### For Production (Recommended):
- ✅ Frontend: Vercel (already done)
- ✅ Backend: **Render.com** (free tier)
- ✅ Database: **Render PostgreSQL** (free 90 days)
- ✅ Storage: **Cloudflare R2** or **AWS S3**

**Total Cost:** $0-7/month (depending on free tier limits)

---

## Step-by-Step: Deploy to Render (Detailed)

### Step 1: Prepare Your Code

1. **Create `.gitignore` in backend folder** (if not exists):
```
node_modules/
.env
*.log
```

2. **Update `package.json` in backend**:
```json
{
  "scripts": {
    "start": "node server.js",
    "server": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

3. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy Database

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Fill in:
   - Name: `zpin-ecommerce-db`
   - Database: `zpin_ecommerce`
   - User: `zpin_user` (or auto-generate)
   - Region: Singapore (closest to India)
   - PostgreSQL Version: 15
   - Plan: Free
4. Click "Create Database"
5. **IMPORTANT:** Copy these values:
   - Internal Database URL
   - External Database URL
   - Host
   - Port
   - Database
   - Username
   - Password

### Step 3: Migrate Data

**Option A: Using pgAdmin**
1. Open pgAdmin
2. Add New Server:
   - Host: (from Render)
   - Port: 5432
   - Database: zpin_ecommerce
   - Username: (from Render)
   - Password: (from Render)
3. Right-click local database → Backup
4. Right-click Render database → Restore

**Option B: Using Command Line**
```bash
# Backup local database
pg_dump -U postgres -d zpin_ecommerce -f backup.sql

# Restore to Render (replace with your Render credentials)
psql -h <render-host> -U <render-user> -d zpin_ecommerce -f backup.sql
```

### Step 4: Deploy Backend

1. On Render, click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name:** `zpin-backend`
   - **Root Directory:** `01react/backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Click "Advanced" → Add Environment Variables:

```env
# Database (use Internal Database URL from Step 2)
DB_HOST=<render-db-host>
DB_PORT=5432
DB_NAME=zpin_ecommerce
DB_USER=<render-db-user>
DB_PASSWORD=<render-db-password>

# Server
PORT=5000
NODE_ENV=production
BASE_URL=https://zpin-backend.onrender.com
FRONTEND_URL=https://www.zpinshop.com

# CORS
ALLOWED_ORIGINS=https://www.zpinshop.com

# JWT (copy from your local .env)
JWT_SECRET=32f58d098be1a680e34d23746d1e7be6bd7ad77041d3c24c2eadbdc7a5365ba30a8aaa10ee6e9424dda7660639be11021dfabe026a718317838c8ad664517892
JWT_REFRESH_SECRET=52077d54ea0930d93832aadd0aba54285ec586de1ed3882268502447b4a4763dd2cbea5ad0b11fe077dd8b6a63631feba2e6ce470b47402dfa42f8ac24921b2c
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=736340596721-8sp5fs6l2cv596tlmqipa9b5ibfguvu7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://zpin-backend.onrender.com/api/v1/auth/google/callback

# Twilio
TWILIO_ACCOUNT_SID=AC11bd0963862e7cedcd431916c60ab50c
TWILIO_AUTH_TOKEN=15608a114f99291ae459626da2056197
TWILIO_PHONE_NUMBER=+919350408533

# Security
BCRYPT_SALT_ROUNDS=10
OTP_EXPIRY_MINUTES=10

# MinIO (temporary - will need cloud storage later)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=zpin-ecommerce
```

5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. Your backend will be at: `https://zpin-backend.onrender.com`

### Step 5: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client
3. Add to "Authorized redirect URIs":
   ```
   https://zpin-backend.onrender.com/api/v1/auth/google/callback
   ```
4. Save

### Step 6: Update Vercel Frontend

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add/Update:
   ```
   VITE_API_URL=https://zpin-backend.onrender.com/api/v1
   VITE_BACKEND_URL=https://zpin-backend.onrender.com
   ```
5. Deployments → Redeploy

### Step 7: Test Everything

1. Visit www.zpinshop.com
2. Try to login
3. Check if data loads
4. Test all features

---

## Important Notes

### Render Free Tier Limitations:
- ⚠️ Backend sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds (cold start)
- ⚠️ Database free for 90 days, then $7/month
- ⚠️ 750 hours/month free (enough for 1 service)

### Solutions for Cold Start:
1. Upgrade to paid plan ($7/month - no sleep)
2. Use a cron job to ping your backend every 10 minutes
3. Use UptimeRobot (free) to keep backend awake

---

## Cost Comparison

### Free Tier (Good for MVP/Testing):
- Render Backend: Free (with cold starts)
- Render Database: Free for 90 days
- Vercel Frontend: Free
- **Total: $0/month** (first 90 days)

### Paid Tier (Production Ready):
- Render Backend: $7/month
- Render Database: $7/month
- Cloudflare R2 Storage: ~$1/month
- Vercel Frontend: Free
- **Total: ~$15/month**

### Alternative (Railway):
- Railway (Backend + Database): $5-10/month
- Cloudflare R2: ~$1/month
- **Total: ~$6-11/month**

---

## Next Steps

1. ✅ Choose a hosting platform (Render recommended)
2. ✅ Deploy PostgreSQL database
3. ✅ Migrate your data
4. ✅ Deploy backend
5. ✅ Update Google OAuth redirect URIs
6. ✅ Update Vercel environment variables
7. ✅ Test your production website
8. ✅ Set up cloud storage (S3/R2) for images

Need help with any step? Let me know!
