-- =====================================================
-- Migration: Convert all timestamp columns to TIMESTAMPTZ
-- and set timezone-aware defaults (Asia/Kolkata / IST)
--
-- Run this ONCE against the vendor PostgreSQL database.
-- Safe to run on Render or any hosted Postgres.
-- =====================================================

-- Set session timezone so DEFAULT NOW() inserts IST going forward
SET timezone = 'Asia/Kolkata';

-- ── orders ────────────────────────────────────────────────────────────────────
ALTER TABLE orders
  ALTER COLUMN created_at      TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at      TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC',
  ALTER COLUMN estimated_delivery TYPE TIMESTAMPTZ USING estimated_delivery AT TIME ZONE 'UTC',
  ALTER COLUMN created_at      SET DEFAULT NOW(),
  ALTER COLUMN updated_at      SET DEFAULT NOW();

-- ── order_items ───────────────────────────────────────────────────────────────
ALTER TABLE order_items
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- ── order_status_history ──────────────────────────────────────────────────────
ALTER TABLE order_status_history
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- ── notifications ─────────────────────────────────────────────────────────────
ALTER TABLE notifications
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- ── return_requests ───────────────────────────────────────────────────────────
ALTER TABLE return_requests
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Verify
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('orders','order_items','order_status_history','notifications','return_requests')
  AND column_name IN ('created_at','updated_at','estimated_delivery')
ORDER BY table_name, column_name;
