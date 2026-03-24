# Category API Documentation

## Overview
The category system supports unlimited depth hierarchical categories for product organization. Categories are fetched dynamically as users navigate through the hierarchy.

## API Endpoints

### 1. Get Root Categories
**Endpoint:** `GET /api/v1/categories/root`

**Description:** Fetches all top-level categories (categories with no parent)

**Response:**
```json
[
  {
    "_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Electronics",
    "parent_id": null,
    "hasChildren": true
  },
  {
    "_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "name": "Fashion",
    "parent_id": null,
    "hasChildren": true
  }
]
```

**Fields:**
- `_id`: Unique category identifier (UUID)
- `name`: Category display name
- `parent_id`: Parent category ID (null for root categories)
- `hasChildren`: Boolean indicating if category has subcategories

---

### 2. Get Child Categories
**Endpoint:** `GET /api/v1/categories/:categoryId/children`

**Description:** Fetches all direct children of a specific category

**Parameters:**
- `categoryId` (path): UUID of the parent category

**Example:** `GET /api/v1/categories/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d/children`

**Response:**
```json
[
  {
    "_id": "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b",
    "name": "Smartphones",
    "parent_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "hasChildren": false
  },
  {
    "_id": "f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c",
    "name": "Laptops",
    "parent_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "hasChildren": false
  }
]
```

---

### 3. Get All Categories
**Endpoint:** `GET /api/v1/categories`

**Description:** Fetches all categories in a flat list (useful for admin/management)

**Response:**
```json
{
  "success": true,
  "count": 17,
  "data": [
    {
      "_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Electronics",
      "parent_id": null,
      "is_active": true
    },
    {
      "_id": "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b",
      "name": "Smartphones",
      "parent_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "is_active": true
    }
  ]
}
```

---

### 4. Get Category by ID
**Endpoint:** `GET /api/v1/categories/:categoryId`

**Description:** Fetches a single category by its ID

**Parameters:**
- `categoryId` (path): UUID of the category

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Electronics",
    "parent_id": null,
    "is_active": true
  }
}
```

---

## Frontend Usage

### AddProduct Component
The AddProduct page uses a dynamic cascading dropdown system:

1. **Initial Load:** Fetches root categories from `/categories/root`
2. **User Selection:** When user selects a category with `hasChildren: true`, fetches children from `/categories/:categoryId/children`
3. **Cascading:** New dropdown appears for each level, allowing unlimited depth
4. **Path Building:** Builds full category path for product submission

### Example Flow:
```
User selects "Fashion" (root)
  → Fetches children → Shows "Men", "Women", "Kids"
User selects "Men"
  → Fetches children → Shows "T-Shirts", "Shirts", "Jeans"
User selects "T-Shirts"
  → No children → Final category selected
```

### Category Path Storage:
Products store the full category path as JSON:
```json
{
  "categoryId": "f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c",
  "deepestCategoryName": "T-Shirts",
  "categoryPath": "[{\"id\":\"b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e\",\"name\":\"Fashion\"},{\"id\":\"b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e\",\"name\":\"Men\"},{\"id\":\"f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c\",\"name\":\"T-Shirts\"}]"
}
```

---

## Current Category Structure

### Root Categories:
- **Electronics** (has children)
  - Smartphones
  - Laptops
  - Headphones
- **Fashion** (has children)
  - Men (has children)
    - T-Shirts
    - Shirts
    - Jeans
  - Women
  - Kids
- **Home & Kitchen**
- **Books**
- **Sports**

---

## Error Handling

### Frontend:
- Shows loading state while fetching categories
- Displays error message if API fails
- Logs detailed information to console for debugging
- Gracefully handles empty category lists

### Backend:
- Returns 500 status with error message on database failures
- Returns 404 for non-existent categories
- Validates category IDs before querying

---

## Testing

Test script available at: `backend/Scripts/test_categories_api.js`

Run with:
```bash
node backend/Scripts/test_categories_api.js
```

Tests:
1. Fetch root categories
2. Fetch all categories
3. Fetch children of a category with subcategories

---

## Notes

- All category endpoints are public (no authentication required)
- Categories are cached in frontend state to avoid redundant API calls
- Only active categories (`is_active: true`) are returned
- Category hierarchy supports unlimited depth
- Duplicate category names exist in database (should be cleaned up)
