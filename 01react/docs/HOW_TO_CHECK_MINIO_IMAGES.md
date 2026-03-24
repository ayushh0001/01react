# How to Check MinIO Images

## Quick Guide: 3 Ways to Check Your Images in MinIO

---

## Method 1: MinIO Web Console (Easiest & Visual) ⭐

### Step 1: Access the Console
Open your browser and go to:
```
http://localhost:9001
```

### Step 2: Login
- **Username**: `minioadmin`
- **Password**: `minioadmin`

### Step 3: Browse Files
1. Click on "Buckets" in the left sidebar
2. Click on `zpin-ecommerce` bucket
3. Navigate to `products/` folder
4. You'll see all uploaded product images with thumbnails!

### Features:
- ✅ Visual thumbnail preview
- ✅ Download images
- ✅ Delete images
- ✅ View image details (size, upload date)
- ✅ Copy image URLs

---

## Method 2: Run the Check Script (Detailed Info)

### Step 1: Run the Script
```bash
cd 01react/backend
node Scripts/check_minio_images.js
```

### What You'll See:
```
═══════════════════════════════════════════════════════════
           MinIO Image Checker & Browser
═══════════════════════════════════════════════════════════

🔍 Checking MinIO connection...

✅ Connected to MinIO successfully!
✅ Bucket "zpin-ecommerce" exists

📊 Bucket Statistics:
═══════════════════════════════════════════════════════════
Total Files: 5
Total Size: 2.45 MB
Image Files: 5
Product Images: 5
Profile Images: 0

📂 Listing all files in bucket...

📁 products/ (5 files)
────────────────────────────────────────────────────────────
  1. 1234567890-keychain.jpg
     Size: 512 KB
     Modified: Mar 10, 2026, 10:30:45 AM
     URL: http://localhost:9000/zpin-ecommerce/products/1234567890-keychain.jpg

🔗 Direct Image URLs:
═══════════════════════════════════════════════════════════
Copy these URLs to test in your browser:

1. http://localhost:9000/zpin-ecommerce/products/1234567890-keychain.jpg
2. http://localhost:9000/zpin-ecommerce/products/1234567891-keychain2.jpg

💡 Paste any URL in your browser to view the image
```

---

## Method 3: Direct URL Access (Quick Test)

### Step 1: Get the Image URL
After uploading a product, the image URL format is:
```
http://localhost:9000/zpin-ecommerce/products/[timestamp]-[filename]
```

### Step 2: Test in Browser
1. Copy the URL from the script output or database
2. Paste it in your browser
3. The image should display immediately

### Example:
```
http://localhost:9000/zpin-ecommerce/products/1710058245123-keychain.jpg
```

---

## Method 4: Check Database for Image URLs

### Step 1: Connect to PostgreSQL
```bash
psql -U postgres -d zpin_ecommerce
```

### Step 2: Query Product Images
```sql
SELECT 
    id,
    product_name,
    images,
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
```

### Step 3: View Image URLs
The `images` column contains an array of MinIO URLs. Copy any URL and paste in browser to test.

---

## Troubleshooting

### Issue 1: Cannot Access Web Console (Port 9001)

**Problem**: Browser shows "Cannot connect" at http://localhost:9001

**Solutions**:
1. Check if MinIO is running:
   ```bash
   # Windows: Check Task Manager for minio.exe
   # Linux/Mac: ps aux | grep minio
   ```

2. Restart MinIO server
   - Make sure it's started with console enabled
   - Default console port is 9001

3. Check firewall settings
   - Allow port 9001 in firewall

### Issue 2: Images Not Showing (Black Screen)

**Problem**: Preview page shows black screen instead of image

**Solutions**:
1. Check browser console (F12) for errors
2. Verify image URL is accessible:
   - Copy URL from console logs
   - Paste in new browser tab
   - Should show the image

3. Check CORS settings:
   - MinIO bucket policy should allow public read
   - Run backend server to initialize bucket policy

4. Verify image format:
   - Supported: JPG, JPEG, PNG, GIF, WEBP
   - Check file is not corrupted

### Issue 3: Script Shows "No Files Found"

**Problem**: `check_minio_images.js` shows empty bucket

**Solutions**:
1. Upload a product with images first
2. Check if images were actually uploaded:
   - Look for success message in backend logs
   - Check network tab in browser DevTools

3. Verify bucket name in .env:
   ```
   MINIO_BUCKET_NAME=zpin-ecommerce
   ```

### Issue 4: Connection Failed

**Problem**: Script shows "Failed to connect to MinIO"

**Solutions**:
1. Verify MinIO is running on port 9000
2. Check .env configuration:
   ```
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   ```

3. Test MinIO health:
   ```bash
   curl http://localhost:9000/minio/health/live
   ```

---

## Understanding Image URLs

### URL Structure:
```
http://localhost:9000/zpin-ecommerce/products/1710058245123-keychain.jpg
│                    │  │               │        │                    │
│                    │  │               │        │                    └─ Original filename
│                    │  │               │        └─ Timestamp (unique)
│                    │  │               └─ Folder (products/profiles)
│                    │  └─ Bucket name
│                    └─ MinIO port
└─ MinIO endpoint
```

### Production URLs:
In production, replace `localhost:9000` with your MinIO server domain:
```
https://minio.zpinshop.com/zpin-ecommerce/products/1710058245123-keychain.jpg
```

---

## Best Practices

### 1. Regular Cleanup
- Delete unused images to save storage
- Use the web console to browse and delete old files

### 2. Image Optimization
- Compress images before upload (max 2MB per image)
- Use appropriate formats (JPEG for photos, PNG for graphics)

### 3. Backup
- Regularly backup MinIO data folder
- Export bucket contents periodically

### 4. Monitoring
- Run the check script weekly to monitor storage usage
- Set up alerts for storage limits

---

## Quick Reference Commands

### Check MinIO Images:
```bash
cd 01react/backend
node Scripts/check_minio_images.js
```

### Access Web Console:
```
http://localhost:9001
Username: minioadmin
Password: minioadmin
```

### Test Image URL:
```
http://localhost:9000/zpin-ecommerce/products/[filename]
```

### Check Database:
```sql
SELECT product_name, images FROM products ORDER BY created_at DESC LIMIT 5;
```

---

## Additional Resources

### MinIO Documentation:
- Official Docs: https://min.io/docs/minio/linux/index.html
- API Reference: https://min.io/docs/minio/linux/developers/javascript/API.html

### Related Files:
- `01react/backend/config/minio.js` - MinIO configuration
- `01react/backend/Controller/productController.js` - Image upload logic
- `01react/backend/.env` - MinIO credentials

---

## Summary

**Easiest Method**: Use MinIO Web Console at http://localhost:9001

**Most Detailed**: Run `node Scripts/check_minio_images.js`

**Quick Test**: Copy image URL and paste in browser

**For Debugging**: Check browser console (F12) for errors
