# 🚀 Deployment Quick Reference

## 📊 Your Current Setup

```
✅ Frontend: Vercel (www.zpinshop.com) - PUBLIC
❌ Backend: localhost:5000 - NOT ACCESSIBLE FROM INTERNET
❌ Database: localhost:5432 (PostgreSQL) - NOT ACCESSIBLE FROM INTERNET
❌ Storage: localhost:9000 (MinIO) - NOT ACCESSIBLE FROM INTERNET
```

## ⚠️ The Problem

Your website is public but can't access your local backend/database!

## ✅ The Solution

Deploy backend + database to cloud. Here's the fastest way:

---

## 🎯 Recommended: Render.com (Free Tier)

### Why Render?
- Free PostgreSQL (90 days)
- Free backend hosting
- Easy setup (30 minutes)
- No credit card needed for free tier

### Quick Steps:

#### 1️⃣ Deploy Database (5 minutes)
1. Go to [render.com](https://render.com) → Sign up
2. New + → PostgreSQL
3. Name: `zpin-ecommerce-db`
4. Plan: Free
5. Create → **Save credentials**

#### 2️⃣ Migrate Data (10 minutes)
```bash
# Backup local database
pg_dump -U postgres -d zpin_ecommerce -f backup.sql

# Restore to Render (use credentials from step 1)
psql -h <render-host> -U <render-user> -d zpin_ecommerce -f backup.sql
```

#### 3️⃣ Deploy Backend (10 minutes)
1. Push code to GitHub
2. Render → New + → Web Service
3. Connect GitHub repo
4. Root Directory: `01react/backend`
5. Build: `npm install`
6. Start: `npm start`
7. Add environment variables (see below)
8. Create

#### 4️⃣ Update Vercel (5 minutes)
1. Vercel Dashboard → Your Project → Settings
2. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```
3. Redeploy

---

## 📝 Environment Variables for Render Backend

Copy these to Render (replace `<render-*>` with your Render database credentials):

```env
# Database (from Render PostgreSQL)
DB_HOST=<render-db-host>
DB_PORT=5432
DB_NAME=zpin_ecommerce
DB_USER=<render-db-user>
DB_PASSWORD=<render-db-password>

# Server
PORT=5000
NODE_ENV=production
BASE_URL=https://your-backend.onrender.com
FRONTEND_URL=https://www.zpinshop.com
ALLOWED_ORIGINS=https://www.zpinshop.com

# Security
BCRYPT_SALT_ROUNDS=10
OTP_EXPIRY_MINUTES=10
```

---

## 🔧 After Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Database migrated successfully
- [ ] Google OAuth redirect URI updated
- [ ] Vercel environment variables updated
- [ ] Frontend redeployed on Vercel
- [ ] Test login on www.zpinshop.com
- [ ] Test all features (products, orders, etc.)

---

## 💰 Cost

### Free Tier (First 90 days):
- Render Backend: **$0**
- Render Database: **$0** (90 days free)
- Vercel Frontend: **$0**
- **Total: $0/month**

### After 90 days:
- Render Backend: $7/month (or keep free with cold starts)
- Render Database: $7/month
- **Total: $7-14/month**

---

## ⚡ Alternative: Railway.app

Even easier but costs $5/month after free credit:

1. [railway.app](https://railway.app) → Sign up
2. New Project → Deploy PostgreSQL
3. New → GitHub Repo → Select yours
4. Add environment variables
5. Done! ($5 free credit/month)

---

## 🆘 Common Issues

### "Cannot connect to database"
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in Render
- Make sure you're using Internal Database URL

### "CORS error"
- Update ALLOWED_ORIGINS in backend
- Update FRONTEND_URL to https://www.zpinshop.com

### "Backend is slow (30-60 seconds)"
- This is Render free tier cold start
- Upgrade to $7/month to remove cold starts
- Or use UptimeRobot to ping every 10 minutes

### "Images not loading"
- MinIO won't work on Render free tier
- Use Cloudflare R2 or AWS S3 instead
- See full guide for migration steps

---

## 📚 Full Documentation

See `01react/docs/PRODUCTION_DATABASE_DEPLOYMENT.md` for:
- Detailed step-by-step guide
- Alternative hosting options
- MinIO to S3/R2 migration
- Troubleshooting guide
- Cost comparisons

---

## 🎯 Summary

**Your Answer:**
- **Database Port:** 5432 (PostgreSQL)
- **Backend Port:** 5000
- **What to do:** Deploy backend + database to Render.com (free)
- **Time needed:** ~30 minutes
- **Cost:** Free for 90 days, then $7-14/month

**Quick Start:** Follow the 4 steps above to deploy on Render.com!
