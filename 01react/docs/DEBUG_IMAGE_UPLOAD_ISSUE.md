# Debug: Images Not Uploading to Database

## Issue
Images are not being sent to the database when submitting the form.

## Debugging Steps

### Step 1: Check Browser Console
Open browser console (F12) and look for these logs when you:
1. Add images in AddProduct form
2. Click "Preview Product"
3. Click "Publish Product"

### Expected Console Logs:

#### In AddProduct (when clicking Preview):
```
[AddProduct] Saving draft product: { imageData: [...], existingImages: [...] }
[AddProduct] Existing images: [...]
[AddProduct] New image data: [...]
```

#### In Preview (when clicking Publish):
```
[Preview] Publishing product: { imageData: [...] }
[Preview] Draft product imageData: [...]
[Preview] Draft product existingImages: [...]
[Preview] Converting X base64 images to files
[Preview] Added image to FormData: filename.jpg Size: 12345 bytes
[Preview] FormData entries:
  productName: Product Name
  images: File(filename.jpg, 12345 bytes)
[Preview] Sending POST request to /products/addProduct
[Preview] Product created successfully: { ... }
```

### Step 2: Check What's Missing

#### If you see "No imageData found in draft product!":
**Problem**: Images are not being converted to base64 in AddProduct

**Solution**:
1. Check if images are selected in the form
2. Verify `images` state has File objects
3. Check for errors in FileReader conversion

#### If you see "Converting 0 base64 images to files":
**Problem**: imageData array is empty

**Solution**:
1. Check localStorage: `localStorage.getItem('draftProduct')`
2. Verify imageData is being saved correctly
3. Check for localStorage quota errors

#### If FormData shows no images:
**Problem**: Images are not being appended to FormData

**Solution**:
1. Check if base64 to Blob conversion is working
2. Verify File objects are being created
3. Check for fetch errors

### Step 3: Check Backend Logs

In your backend terminal, look for:
```
[Products] Uploading X images to MinIO...
[Products] Uploaded image 1: products/...
[Products] Created product: id - name
```

If you don't see these logs:
- Images are not reaching the backend
- Check network tab in browser DevTools
- Verify FormData is being sent

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Click "Publish Product"
3. Find the POST request to `/api/v1/products/addProduct`
4. Check:
   - Request Headers: `Content-Type: multipart/form-data`
   - Request Payload: Should show files
   - Response: Check for errors

### Step 5: Test with Small Image

Try uploading a very small image (< 100KB):
1. Use a simple PNG or JPG
2. Check if it uploads successfully
3. If yes, the issue is image size

### Step 6: Check localStorage Quota

Run in browser console:
```javascript
// Check current usage
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log('localStorage usage:', (total / 1024).toFixed(2), 'KB');

// Check draft product
const draft = localStorage.getItem('draftProduct');
if (draft) {
  console.log('Draft product size:', (draft.length / 1024).toFixed(2), 'KB');
  const parsed = JSON.parse(draft);
  console.log('Draft product:', parsed);
  console.log('Has imageData:', !!parsed.imageData);
  console.log('ImageData length:', parsed.imageData?.length);
}
```

## Common Issues & Solutions

### Issue 1: localStorage Quota Exceeded

**Symptoms**:
- Error: "QuotaExceededError"
- Images not saving to draft

**Solution**:
```javascript
// Clear localStorage
localStorage.clear();

// Or just clear draft data
localStorage.removeItem('draftProduct');
localStorage.removeItem('editProduct');
```

**Prevention**:
- Use smaller images (< 500KB each)
- Compress images before upload
- Limit to 3-4 images per product

### Issue 2: Base64 Conversion Failing

**Symptoms**:
- imageData array is empty
- No console errors

**Solution**:
Check FileReader in AddProduct.jsx:
```javascript
const reader = new FileReader();
reader.onloadend = () => {
  console.log('Image converted:', file.name);
  resolve({ ... });
};
reader.onerror = (error) => {
  console.error('FileReader error:', error);
};
reader.readAsDataURL(file);
```

### Issue 3: FormData Not Sending Files

**Symptoms**:
- Backend receives empty files array
- Network tab shows no files in payload

**Solution**:
Verify FormData creation:
```javascript
const formData = new FormData();
formData.append("images", file);

// Check what's in FormData
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}
```

### Issue 4: Backend Not Receiving Images

**Symptoms**:
- Frontend sends files
- Backend logs show no images

**Solution**:
1. Check multer configuration in backend
2. Verify field name matches: `upload.array('images', 10)`
3. Check file size limits in multer

## Quick Test Script

Run this in browser console after adding images:

```javascript
// Test 1: Check if images are in state
console.log('=== IMAGE UPLOAD DEBUG ===');

// Test 2: Check draft product
const draft = localStorage.getItem('draftProduct');
if (draft) {
  const parsed = JSON.parse(draft);
  console.log('✅ Draft product exists');
  console.log('  - Has imageData:', !!parsed.imageData);
  console.log('  - ImageData count:', parsed.imageData?.length || 0);
  console.log('  - Has existingImages:', !!parsed.existingImages);
  console.log('  - ExistingImages count:', parsed.existingImages?.length || 0);
  
  if (parsed.imageData && parsed.imageData.length > 0) {
    console.log('  - First image size:', (parsed.imageData[0].dataUrl.length / 1024).toFixed(2), 'KB');
  }
} else {
  console.log('❌ No draft product found');
}

// Test 3: Check localStorage size
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length;
  }
}
console.log('localStorage total:', (total / 1024).toFixed(2), 'KB / ~5120 KB limit');
```

## Expected Behavior

### New Product Flow:
1. User adds images → stored in `images` state (File objects)
2. Click Preview → convert to base64 → save to `draftProduct.imageData`
3. Preview shows images from base64
4. Click Publish → convert base64 back to File → send via FormData
5. Backend receives files → uploads to MinIO → saves URLs to database

### Edit Product Flow:
1. User clicks Edit → fetch product with MinIO URLs
2. Images stored in `existingImages` state
3. Click Preview → keep URLs in `draftProduct.existingImages`
4. Preview shows images from URLs
5. Click Publish → send URLs (no upload needed)
6. Backend keeps existing image URLs

## Files to Check

1. **AddProduct.jsx** - Line ~470 (handleSubmit)
   - Check if imageData is being created
   - Verify localStorage.setItem is called

2. **Preview.jsx** - Line ~90 (handlePublish)
   - Check if FormData has images
   - Verify fetch to blob conversion

3. **productController.js** - Line ~1 (addProduct)
   - Check if req.files exists
   - Verify multer is working

## Next Steps

1. Open browser console
2. Add a product with 1 small image
3. Click Preview
4. Check console logs
5. Click Publish
6. Check console logs
7. Report what you see

If images still don't upload, share:
- Console logs from browser
- Backend terminal logs
- Network tab screenshot
