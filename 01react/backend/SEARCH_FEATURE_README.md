# Advanced Search & Filtering System

This document explains the intelligent search and filtering system implemented for the Zpin e-commerce platform.

## Overview

The system uses Natural Language Processing (NLP) to automatically extract searchable keywords from product descriptions and implements PostgreSQL full-text search for fast, intelligent product discovery.

## Features

### 1. Automatic Keyword Extraction
When vendors add or update products, the system automatically extracts:
- **Materials**: cotton, silk, leather, polyester, etc.
- **Fits**: slim fit, regular fit, oversized, etc.
- **Seasons**: summer, winter, spring, etc.
- **Occasions**: casual, formal, party, wedding, etc.
- **Styles**: vintage, modern, classic, trendy, etc.
- **Colors**: black, white, red, blue, etc.
- **Patterns**: solid, striped, floral, printed, etc.

### 2. Full-Text Search
- Uses PostgreSQL's built-in full-text search capabilities
- Searches across product names, descriptions, and extracted tags
- Supports relevance ranking
- Handles word variations (e.g., "running" matches "runs", "ran")

### 3. Attribute-Based Filtering
Customers can filter products by:
- Material (e.g., show only cotton products)
- Color (e.g., show only black items)
- Fit type (e.g., slim fit only)
- Season (e.g., summer wear)
- Occasion (e.g., formal events)
- Style (e.g., vintage)
- Pattern (e.g., floral)
- Price range
- Category

## Installation

### Step 1: Run Database Migration

```bash
cd zpin-vendor/01react/backend
node scripts/run_search_migration.js
```

This creates:
- `search_tags` column (TEXT[]) - Array of searchable keywords
- `search_vector` column (TSVECTOR) - Full-text search index
- `extracted_attributes` column (JSONB) - Structured attributes
- GIN indexes for fast searching
- Automatic trigger to update search_vector

### Step 2: Update Existing Products

```bash
node scripts/update_existing_products.js
```

This processes all existing products and extracts keywords from their descriptions.

## API Usage

### Advanced Search Endpoint

**Endpoint**: `GET /api/products/search`

**Query Parameters**:
- `q` - Search query (e.g., "cotton summer shirt")
- `category` - Filter by category
- `material` - Filter by material (e.g., "cotton")
- `color` - Filter by color (e.g., "black")
- `fit` - Filter by fit (e.g., "slim fit")
- `season` - Filter by season (e.g., "summer")
- `occasion` - Filter by occasion (e.g., "casual")
- `style` - Filter by style (e.g., "modern")
- `pattern` - Filter by pattern (e.g., "solid")
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `sortBy` - Sort option: `relevance`, `price_asc`, `price_desc`, `newest`

**Example Requests**:

```javascript
// Search for cotton summer shirts
GET /api/products/search?q=cotton summer shirt&sortBy=relevance

// Find black formal wear
GET /api/products/search?color=black&occasion=formal

// Get slim fit casual clothes under $50
GET /api/products/search?fit=slim fit&occasion=casual&maxPrice=50

// Search with multiple filters
GET /api/products/search?q=dress&material=silk&color=red&season=summer
```

**Response Format**:

```json
{
  "success": true,
  "products": [
    {
      "id": 123,
      "product_name": "Cotton Summer Shirt",
      "description": "...",
      "price": 29.99,
      "search_tags": ["cotton", "summer", "casual", "shirt"],
      "extracted_attributes": {
        "materials": ["cotton"],
        "seasons": ["summer"],
        "occasions": ["casual"],
        "colors": ["blue"],
        "patterns": ["solid"]
      },
      "images": ["..."]
    }
  ],
  "filters": {
    "materials": ["cotton", "polyester", "silk"],
    "colors": ["black", "blue", "white"],
    "fits": ["slim fit", "regular fit"],
    "seasons": ["summer", "winter"],
    "occasions": ["casual", "formal"],
    "styles": ["modern", "classic"],
    "patterns": ["solid", "striped"]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## How It Works

### Backend Flow

1. **Product Creation/Update**:
   ```javascript
   // In productController.js
   const extracted = extractKeywords(productName + ' ' + description, category);
   const searchTags = generateSearchTags(extracted);
   
   // Save to database
   INSERT INTO products (..., search_tags, extracted_attributes)
   VALUES (..., searchTags, JSON.stringify(extracted))
   ```

2. **Automatic Search Vector Update**:
   - PostgreSQL trigger automatically updates `search_vector` column
   - Combines product name (weight A), description (weight B), and tags (weight C)
   - Optimized for fast full-text search

3. **Search Query**:
   ```sql
   SELECT * FROM products
   WHERE search_vector @@ plainto_tsquery('english', 'cotton shirt')
   ORDER BY ts_rank(search_vector, query) DESC
   ```

4. **Attribute Filtering**:
   ```sql
   SELECT * FROM products
   WHERE extracted_attributes->'materials' ? 'cotton'
   AND extracted_attributes->'colors' ? 'black'
   ```

## Frontend Integration

### Example: Search Component

```javascript
import { useState, useEffect } from 'react';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({});

  const searchProducts = async () => {
    const params = new URLSearchParams({
      q: query,
      ...filters,
      sortBy: 'relevance'
    });

    const response = await fetch(`/api/products/search?${params}`);
    const data = await response.json();
    
    setProducts(data.products);
    setAvailableFilters(data.filters);
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      
      {/* Material Filter */}
      <select onChange={(e) => setFilters({...filters, material: e.target.value})}>
        <option value="">All Materials</option>
        {availableFilters.materials?.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* Color Filter */}
      <select onChange={(e) => setFilters({...filters, color: e.target.value})}>
        <option value="">All Colors</option>
        {availableFilters.colors?.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <button onClick={searchProducts}>Search</button>

      {/* Display products */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Performance

- **GIN Indexes**: Fast array and JSONB searches
- **Full-Text Search**: Optimized for natural language queries
- **Automatic Updates**: Trigger keeps search_vector in sync
- **Pagination**: Efficient handling of large result sets

## Extending the System

### Adding New Attributes

Edit `zpin-vendor/01react/backend/utils/keywordExtractor.js`:

```javascript
// Add new attribute category
const FABRICS = ['denim', 'canvas', 'twill', 'jersey'];

// Update extraction function
export function extractKeywords(text, categoryName = '') {
  const extracted = {
    // ... existing attributes
    fabrics: []
  };

  FABRICS.forEach(fabric => {
    if (lowerText.includes(fabric)) {
      extracted.fabrics.push(fabric);
    }
  });

  return extracted;
}
```

### Custom Search Ranking

Modify the search query in `productController.js`:

```javascript
// Boost recent products
ORDER BY 
  ts_rank(search_vector, query) * 
  (1 + EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400) DESC
```

## Troubleshooting

### Migration Fails
```bash
# Check if columns already exist
psql -d zpin_vendor -c "\d products"

# Drop existing columns if needed
psql -d zpin_vendor -c "ALTER TABLE products DROP COLUMN IF EXISTS search_tags;"
```

### Search Returns No Results
```bash
# Check if search_vector is populated
psql -d zpin_vendor -c "SELECT id, search_vector FROM products LIMIT 5;"

# Manually trigger update
psql -d zpin_vendor -c "UPDATE products SET product_name = product_name;"
```

### Slow Searches
```bash
# Verify indexes exist
psql -d zpin_vendor -c "\di"

# Analyze query performance
psql -d zpin_vendor -c "EXPLAIN ANALYZE SELECT * FROM products WHERE search_vector @@ plainto_tsquery('cotton');"
```

## Future Enhancements

1. **Synonym Support**: Map "tee" to "t-shirt", "jeans" to "denim pants"
2. **Typo Tolerance**: Use trigram similarity for fuzzy matching
3. **AI Embeddings**: Semantic search using vector databases
4. **Auto-Complete**: Suggest search terms as user types
5. **Search Analytics**: Track popular searches and improve results

## Support

For issues or questions, contact the development team or check the main project documentation.
