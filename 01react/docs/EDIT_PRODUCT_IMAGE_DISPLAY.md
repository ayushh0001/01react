# Edit Product - Image Display Feature

## Overview
When editing a product, the system now properly fetches and displays the existing product images from MinIO storage.

## Implementation Details

### 1. Products Page (Products.jsx)

#### handleEdit Function
When user clicks "Edit" button:
1. Fetches full product details from API: `GET /products/:id`
2. Extracts product data including images array
3. Stores in localStorage as `editProduct`
4. Navigates to AddProduct page

```javascript
const handleEdit = async (product) => {
  const response = await API.get(`/products/${product.id}`);
  const fullProduct = response.data.product || response.data;
  
  const editData = {
    _id: fullProduct.id,
    productName: fullProduct.product_name,
    images: fullProduct.images || []  // MinIO URLs
    // ... other fields
  };
  
  localStorage.setItem('editProduct', JSON.stringify(editData));
  navigate('/dashboard/add-product');
};
```

### 2. AddProduct Page (AddProduct.jsx)

#### Image Restoration on Mount
When component loads:
1. Checks for `editProduct` in localStorage
2. Extracts images array (MinIO URLs)
3. Sets as `existingImages` state
4. Displays images in the form

```javascript
useEffect(() => {
  const editProduct = JSON.parse(localStorage.getItem('editProduct') || 'null');
  
  if (editProduct) {
    // Restore form fields
    setForm({ ... });
    
    // Restore images
    if (Array.isArray(editProduct.images) && editProduct.images.length > 0) {
      console.log('[AddProduct] Setting existing images:', editProduct.images);
      setExistingImages(editProduct.images);
    }
  }
}, []);
```

#### Image Display in Form
Existing images are displayed with:
- White background (`bg-white`)
- `object-contain` for proper aspect ratio
- Error handler for failed loads
- Remove button for each image

```jsx
{existingImages.map((imageUrl, idx) => (
  <div key={`existing-${idx}`} className="relative inline-block">
    <img
      src={imageUrl}
      alt="existing preview"
      className="w-[100px] h-[100px] object-contain rounded-md shadow border bg-white"
      onError={(e) => {
        console.error('Failed to load existing image:', imageUrl);
        e.target.src = 'fallback-image-svg';
      }}
    />
    <button onClick={() => removeImage(idx)}>×</button>
  </div>
))}
```

#### Draft Product Creation
When navigating to Preview:
1. Converts NEW images to base64 (if any)
2. Keeps existing images as MinIO URLs
3. Stores both in `draftProduct`

```javascript
const draftProduct = {
  imageData: imageData,           // Base64 for NEW images
  existingImages: existingImages  // MinIO URLs for existing images
};
```

### 3. Preview Page (Preview.jsx)

#### Image Priority Logic
When loading draft product:
1. **Priority 1**: Use existing MinIO URLs (for edited products)
2. **Priority 2**: Use base64 data (for new products)

```javascript
const fetchLatestProduct = async () => {
  const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
  
  let imageUrls = [];
  
  // Priority 1: Existing MinIO images
  if (draftProduct.existingImages && draftProduct.existingImages.length > 0) {
    imageUrls = draftProduct.existingImages;
  }
  // Priority 2: Base64 image data
  else if (draftProduct.imageData && draftProduct.imageData.length > 0) {
    imageUrls = draftProduct.imageData.map(img => img.dataUrl);
  }
  
  setProduct({ images: imageUrls, ... });
};
```

#### Image Display
- Uses `object-contain` instead of `object-cover`
- White background to prevent black screen
- Error handlers with fallback SVG
- Hover effects and zoom

## Image Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EDIT PRODUCT FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. Products Page
   ├─ User clicks "Edit" button
   ├─ Fetch product: GET /products/:id
   ├─ Extract images: ["http://localhost:9000/...jpg"]
   └─ Store in localStorage: editProduct

2. AddProduct Page (Mount)
   ├─ Read editProduct from localStorage
   ├─ Extract images array (MinIO URLs)
   ├─ Set existingImages state
   └─ Display images in form
        ├─ Show thumbnails (100x100)
        ├─ White background
        ├─ object-contain
        └─ Remove button

3. User Modifies Product
   ├─ Can add new images (File objects)
   ├─ Can remove existing images
   └─ Can keep existing images

4. Click "Preview Product"
   ├─ Convert NEW images to base64
   ├─ Keep existing images as URLs
   └─ Create draftProduct:
        ├─ imageData: [base64 for new images]
        └─ existingImages: [MinIO URLs]

5. Preview Page
   ├─ Read draftProduct from localStorage
   ├─ Priority 1: Use existingImages (MinIO URLs)
   ├─ Priority 2: Use imageData (base64)
   └─ Display images
        ├─ Main image (square aspect ratio)
        ├─ Thumbnails
        └─ Full-screen modal

6. Click "Publish Product"
   ├─ If editing: PUT /products/:id
   │   └─ Keep existing images (no re-upload)
   └─ If new: POST /products/addProduct
       └─ Upload new images to MinIO
```

## Key Features

### 1. Image Source Handling
- **Existing Images**: MinIO URLs (http://localhost:9000/...)
- **New Images**: File objects → Base64 → MinIO on publish

### 2. Error Handling
- Failed image loads show fallback SVG
- Console logging for debugging
- User-friendly error messages

### 3. Performance Optimization
- Only convert new images to base64
- Existing images use direct URLs (no conversion)
- Lazy loading for large images

### 4. User Experience
- Thumbnails show immediately
- Remove button for each image
- Visual feedback on hover
- Smooth transitions

## Image Display Styles

### AddProduct Form
```css
.image-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: contain;  /* Shows full image */
  background: white;    /* Prevents black screen */
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Preview Page
```css
.main-image {
  aspect-ratio: 1/1;    /* Square container */
  object-fit: contain;  /* Shows full image */
  background: white;    /* Prevents black screen */
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: white;
}
```

## Troubleshooting

### Issue 1: Images Not Showing in Edit Mode

**Symptoms**: Black screen or no images when editing

**Solutions**:
1. Check browser console for errors
2. Verify image URLs are accessible:
   ```javascript
   console.log('[AddProduct] Edit product images:', editProduct.images);
   ```
3. Test URL in browser directly
4. Check MinIO is running on port 9000

### Issue 2: Images Show as "Error"

**Symptoms**: Fallback SVG shows instead of image

**Solutions**:
1. Verify MinIO bucket policy allows public read
2. Check CORS settings
3. Ensure image URLs are correct format
4. Test URL: `http://localhost:9000/zpin-ecommerce/products/...`

### Issue 3: Mixed Images (Some Show, Some Don't)

**Symptoms**: Some images load, others show error

**Solutions**:
1. Check individual image URLs in console
2. Verify all images exist in MinIO
3. Check for URL encoding issues (spaces, special chars)
4. Run MinIO check script:
   ```bash
   node Scripts/check_minio_images.js
   ```

## Testing Checklist

- [x] Edit product loads existing images
- [x] Images display correctly (not black)
- [x] Can remove existing images
- [x] Can add new images
- [x] Preview shows existing images
- [x] Preview shows new images
- [x] Publish keeps existing images
- [x] Error handler works for failed loads
- [x] Console logging helps debugging
- [x] Responsive on mobile

## Console Logs for Debugging

When editing a product, check console for:

```
[Products] Full product for editing: { images: [...] }
[AddProduct] Loading product for editing: { ... }
[AddProduct] Edit product images: ["http://localhost:9000/..."]
[AddProduct] Setting existing images: [...]
[AddProduct] Saving draft product: { existingImages: [...] }
[Preview] Draft product from localStorage: { ... }
[Preview] Using existing MinIO images: [...]
[Preview] Final image URLs: [...]
```

## Related Files

- `01react/src/Dashboard/Products.jsx` - Edit button handler
- `01react/src/Dashboard/AddProduct.jsx` - Image restoration and display
- `01react/src/Dashboard/Preview.jsx` - Image preview logic
- `01react/backend/Controller/productController.js` - API endpoints
- `01react/backend/config/minio.js` - MinIO configuration

## API Endpoints Used

### Get Product Details
```
GET /api/v1/products/:id
Response: {
  product: {
    id: "...",
    product_name: "...",
    images: ["http://localhost:9000/..."],
    ...
  }
}
```

### Update Product
```
PUT /api/v1/products/:id
Body: {
  productName: "...",
  images: ["existing-urls"],  // Keep existing images
  ...
}
```

## Summary

The edit product feature now properly:
1. ✅ Fetches existing images from database
2. ✅ Displays MinIO URLs in edit form
3. ✅ Shows images with proper styling
4. ✅ Handles errors gracefully
5. ✅ Preserves images through preview
6. ✅ Keeps existing images on update
7. ✅ Allows adding/removing images
8. ✅ Provides debugging logs

Users can now edit products and see their existing images immediately!
