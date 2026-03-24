-- Migration: Add search and filtering features
-- This adds columns for keyword extraction and full-text search

-- Add search_tags column to store extracted keywords
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS search_tags TEXT[] DEFAULT '{}';

-- Add search_vector column for full-text search
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Add extracted_attributes column to store structured attributes
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS extracted_attributes JSONB DEFAULT '{}';

-- Create GIN index for array search (search_tags)
CREATE INDEX IF NOT EXISTS idx_products_search_tags ON products USING GIN (search_tags);

-- Create GIN index for full-text search (search_vector)
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN (search_vector);

-- Create GIN index for extracted attributes
CREATE INDEX IF NOT EXISTS idx_products_extracted_attributes ON products USING GIN (extracted_attributes);

-- Add comments
COMMENT ON COLUMN products.search_tags IS 'Array of searchable keywords extracted from product name and description';
COMMENT ON COLUMN products.search_vector IS 'Full-text search vector for PostgreSQL FTS';
COMMENT ON COLUMN products.extracted_attributes IS 'Structured attributes like materials, colors, fits, etc.';

-- Create function to automatically update search_vector
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.product_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.search_tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search_vector
DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE OF product_name, description, search_tags
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();

-- Example queries after migration:

-- Full-text search:
-- SELECT * FROM products WHERE search_vector @@ to_tsquery('english', 'cotton & shirt');

-- Tag search:
-- SELECT * FROM products WHERE 'cotton' = ANY(search_tags);

-- Attribute search:
-- SELECT * FROM products WHERE extracted_attributes->>'material' = 'cotton';

-- Combined search with ranking:
-- SELECT *, ts_rank(search_vector, query) AS rank
-- FROM products, to_tsquery('english', 'summer & cotton') query
-- WHERE search_vector @@ query
-- ORDER BY rank DESC;

-- Migration rollback (if needed):
-- DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
-- DROP FUNCTION IF EXISTS products_search_vector_update();
-- DROP INDEX IF EXISTS idx_products_search_tags;
-- DROP INDEX IF EXISTS idx_products_search_vector;
-- DROP INDEX IF EXISTS idx_products_extracted_attributes;
-- ALTER TABLE products DROP COLUMN IF EXISTS search_tags;
-- ALTER TABLE products DROP COLUMN IF EXISTS search_vector;
-- ALTER TABLE products DROP COLUMN IF EXISTS extracted_attributes;
