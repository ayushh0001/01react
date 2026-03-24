-- Migration: Add size_quantities column to products table
-- This allows storing size-specific inventory for products

-- Add size_quantities column as JSONB to store size and quantity pairs
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size_quantities JSONB DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN products.size_quantities IS 'Stores size-specific quantities as JSON object, e.g., {"S": 10, "M": 15, "L": 20}';

-- Create an index on size_quantities for better query performance
CREATE INDEX IF NOT EXISTS idx_products_size_quantities ON products USING GIN (size_quantities);

-- Example data structure:
-- For clothing: {"XS": 5, "S": 10, "M": 15, "L": 20, "XL": 10}
-- For footwear: {"7": 5, "8": 10, "9": 15, "10": 12, "11": 8}
-- For one-size items: {} or {"One Size": 50}

-- Migration rollback (if needed):
-- ALTER TABLE products DROP COLUMN IF EXISTS size_quantities;
-- DROP INDEX IF EXISTS idx_products_size_quantities;
