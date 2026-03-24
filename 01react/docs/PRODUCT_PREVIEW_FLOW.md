# Product Preview Flow - Complete Implementation

## ✅ Status: FULLY WORKING

The product creation flow now uses a two-step process with preview before publishing.

---

## Flow Overview

### Step 1: Add Product (Form)
**Page:** `/dashboard/add-product`

1. User fills in product details:
   - Product Name
   - Price
   - Inventory Quantity
   - Category (cascading dropdowns)
   - Description
   - Images (multiple upload)

2. User clicks "Preview Product" button

3. System:
   - Validates all required fields
   - Converts images to base64 format
   - Saves draft to localStorage
   - Redirects to Preview page

### Step 2: Preview & Publish
**Page:** `/dashboard/preview`

1. User sees product preview with:
   - All product details
   - Image gallery with thumbnails
   - Category path
   - Price and stock

2. User has two options:
   - **Edit Details**: Go back to AddProduct page (draft preserved)
   - **Publish Product**: Save to database and MinIO

3. When "Publish Product" is clicked:
   - Base64 images converted back to File objects
   - FormData created with all product details
   - POST request to `/api/v1/products/addProduct`
   - Images uploaded to MinIO
   - Product saved to PostgreSQL database
   - Success popup shown
   - Redirect to Products page

---

## Technical Implementation

### AddProduct.jsx Changes

**Button Text:**
- Changed from "Add Product" to "Preview Product"

**Submit Handler:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  // Convert images to base64
  const imageDataPromises = images.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    });
  });
  
  const imageData = await Promise.all(imageDataPromises);
  
  // Save draft to localStorage
  const draftProduct = {
    name, price, stock, description,
    categoryId, deepestCategoryName, categoryPath,
    imageData, existingImages
  };
  
  localStorage.setItem('draftProduct', JSON.stringify(draftProduct));
  navigate('/dashboard/preview');
};
```

### Preview.jsx Changes

**Fetch Draft:**
```javascript
const fetchLatestProduct = async () => {
  const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
  
  if (draftProduct) {
    // Create preview URLs from base64 data
    const imageUrls = draftProduct.imageData.map(img => img.dataUrl);
    setProduct({...draftProduct, images: imageUrls});
  }
};
```

**Publish Handler:**
```javascript
const handlePublish = async () => {
  const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
  
  // Create FormData
  const formData = new FormData();
  formData.append("productName", draftProduct.name);
  formData.append("description", draftProduct.description);
  formData.append("categoryId", draftProduct.categoryId);
  formData.append("deepestCategoryName", draftProduct.deepestCategoryName);
  formData.append("categoryPath", draftProduct.categoryPath);
  formData.append("price", parseFloat(draftProduct.price));
  formData.append("quantity", parseInt(draftProduct.stock));
  
  // Convert base64 back to File objects
  for (const imgData of draftProduct.imageData) {
    const response = await fetch(imgData.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], imgData.name, { type: imgData.type });
    formData.append("images", file);
  }
  
  // POST to API
  await API.post('/products/addProduct', formData);
  
  // Clear draft and redirect
  localStorage.removeItem('draftProduct');
  navigate('/dashboard/products');
};
```

---

## Data Flow

### localStorage Structure

**draftProduct:**
```json
{
  "name": "Product Name",
  "price": 999.99,
  "stock": 50,
  "description": "Product description",
  "categoryId": "uuid",
  "deepestCategoryName": "T-Shirts",
  "categoryPath": "[{\"id\":\"...\",\"name\":\"Fashion\"},{\"id\":\"...\",\"name\":\"Men\"},{\"id\":\"...\",\"name\":\"T-Shirts\"}]",
  "categoryPathLabel": "Fashion > Men > T-Shirts",
  "imageData": [
    {
      "name": "image1.jpg",
      "type": "image/jpeg",
      "size": 123456,
      "dataUrl": "data:image/jpeg;base64,/9j/4AAQ..."
    }
  ],
  "existingImages": []
}
```

### API Request (FormData)

**Endpoint:** `POST /api/v1/products/addProduct`

**Content-Type:** `multipart/form-data`

**Fields:**
- `productName`: string
- `description`: string
- `categoryId`: UUID
- `deepestCategoryName`: string
- `categoryPath`: JSON string
- `price`: number
- `quantity`: number
- `images`: File[] (multiple files)

### Database Storage

**products table:**
```sql
INSERT INTO products (
  user_id,
  product_name,
  description,
  category_id,
  deepest_category_name,
  category_path,
  price,
  quantity,
  in_stock
) VALUES (...)
```

**product_images table:**
```sql
INSERT INTO product_images (
  product_id,
  image_url,
  display_order
) VALUES (...)
```

### MinIO Storage

**Bucket:** `zpin-ecommerce`

**Path:** `products/{productId}/{timestamp}-{index}-{filename}`

**Example:** `products/abc123.../1710012345-0-image1.jpg`

**Public URL:** `http://localhost:9000/zpin-ecommerce/products/...`

---

## User Experience

### Success Flow:
1. Fill form → "Preview Product" → See preview → "Publish Product" → Success popup → Products page

### Edit Flow:
1. Fill form → "Preview Product" → See preview → "Edit Details" → Back to form (data preserved)

### Error Handling:
- Missing required fields → Error message on AddProduct page
- No images → Error message on AddProduct page
- API error → Alert with error message on Preview page
- Network error → Alert with error message

---

## Benefits

✅ **User Confirmation**: Users can review before publishing
✅ **Error Prevention**: Catch mistakes before saving to database
✅ **Better UX**: Clear two-step process
✅ **Image Preview**: See exactly how product will look
✅ **Easy Editing**: Go back and modify without losing data
✅ **Clean Database**: Only published products saved

---

## Testing

### Test Flow:
1. Navigate to http://localhost:5173/dashboard/add-product
2. Fill in all fields and upload images
3. Click "Preview Product"
4. Verify preview shows correct data and images
5. Click "Publish Product"
6. Verify success popup appears
7. Check Products page for new product
8. Verify images are in MinIO
9. Verify product is in database

### Test Edit Flow:
1. Fill form and go to preview
2. Click "Edit Details"
3. Verify form is pre-filled with data
4. Modify some fields
5. Go to preview again
6. Verify changes are reflected

---

## Files Modified

- `src/Dashboard/AddProduct.jsx` - Changed submit to save draft and navigate
- `src/Dashboard/Preview.jsx` - Added publish functionality with API integration
- `docs/PRODUCT_PREVIEW_FLOW.md` - This documentation

---

## Notes

- Images are converted to base64 for localStorage storage (File objects can't be serialized)
- Base64 images are converted back to File objects before API upload
- Draft is cleared after successful publish
- Category path is stored as JSON string for database
- Multiple images supported with proper ordering
