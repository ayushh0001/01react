-- =====================================================
-- Migration: Convert all UUID primary keys to VARCHAR(7)
-- Run this ONCE against the vendor PostgreSQL database.
-- =====================================================

-- Drop UUID extension dependency on defaults first
ALTER TABLE users               ALTER COLUMN id DROP DEFAULT;
ALTER TABLE products            ALTER COLUMN id DROP DEFAULT;
ALTER TABLE product_images      ALTER COLUMN id DROP DEFAULT;
ALTER TABLE product_reviews     ALTER COLUMN id DROP DEFAULT;
ALTER TABLE categories          ALTER COLUMN id DROP DEFAULT;
ALTER TABLE orders              ALTER COLUMN id DROP DEFAULT;
ALTER TABLE order_items         ALTER COLUMN id DROP DEFAULT;
ALTER TABLE order_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE notifications       ALTER COLUMN id DROP DEFAULT;
ALTER TABLE return_requests     ALTER COLUMN id DROP DEFAULT;
ALTER TABLE wishlists           ALTER COLUMN id DROP DEFAULT;
ALTER TABLE cart_items          ALTER COLUMN id DROP DEFAULT;
ALTER TABLE otp_verifications   ALTER COLUMN id DROP DEFAULT;
ALTER TABLE password_reset_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE refresh_tokens      ALTER COLUMN id DROP DEFAULT;
ALTER TABLE seller_business_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE seller_bank_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE seller_earnings     ALTER COLUMN id DROP DEFAULT;
ALTER TABLE seller_payouts      ALTER COLUMN id DROP DEFAULT;
ALTER TABLE payments            ALTER COLUMN id DROP DEFAULT;
ALTER TABLE refunds             ALTER COLUMN id DROP DEFAULT;
ALTER TABLE coupons             ALTER COLUMN id DROP DEFAULT;
ALTER TABLE delivery_partner_earnings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE delivery_issues     ALTER COLUMN id DROP DEFAULT;

-- ── users ─────────────────────────────────────────────────────────────────────
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(7) USING id::text;

-- ── products ──────────────────────────────────────────────────────────────────
ALTER TABLE products ALTER COLUMN id      TYPE VARCHAR(7) USING id::text;
ALTER TABLE products ALTER COLUMN user_id TYPE VARCHAR(7) USING user_id::text;

ALTER TABLE product_images ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE product_images ALTER COLUMN product_id TYPE VARCHAR(7) USING product_id::text;

ALTER TABLE product_reviews ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE product_reviews ALTER COLUMN product_id TYPE VARCHAR(7) USING product_id::text;
ALTER TABLE product_reviews ALTER COLUMN user_id    TYPE VARCHAR(7) USING user_id::text;

-- ── categories ────────────────────────────────────────────────────────────────
ALTER TABLE categories ALTER COLUMN id        TYPE VARCHAR(7) USING id::text;
ALTER TABLE categories ALTER COLUMN parent_id TYPE VARCHAR(7) USING parent_id::text;

-- ── orders ────────────────────────────────────────────────────────────────────
ALTER TABLE orders ALTER COLUMN id              TYPE VARCHAR(7) USING id::text;
ALTER TABLE orders ALTER COLUMN user_id         TYPE VARCHAR(7) USING user_id::text;
ALTER TABLE orders ALTER COLUMN seller_id       TYPE VARCHAR(7) USING seller_id::text;
ALTER TABLE orders ALTER COLUMN delivery_boy_id TYPE VARCHAR(7) USING delivery_boy_id::text;

ALTER TABLE order_items ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE order_items ALTER COLUMN order_id   TYPE VARCHAR(7) USING order_id::text;
ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(7) USING product_id::text;

ALTER TABLE order_status_history ALTER COLUMN id       TYPE VARCHAR(7) USING id::text;
ALTER TABLE order_status_history ALTER COLUMN order_id TYPE VARCHAR(7) USING order_id::text;

ALTER TABLE return_requests ALTER COLUMN id       TYPE VARCHAR(7) USING id::text;
ALTER TABLE return_requests ALTER COLUMN order_id TYPE VARCHAR(7) USING order_id::text;
ALTER TABLE return_requests ALTER COLUMN user_id  TYPE VARCHAR(7) USING user_id::text;

-- ── notifications ─────────────────────────────────────────────────────────────
ALTER TABLE notifications ALTER COLUMN id      TYPE VARCHAR(7) USING id::text;
ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(7) USING user_id::text;

-- ── cart / wishlist ───────────────────────────────────────────────────────────
ALTER TABLE wishlists ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE wishlists ALTER COLUMN user_id    TYPE VARCHAR(7) USING user_id::text;
ALTER TABLE wishlists ALTER COLUMN product_id TYPE VARCHAR(7) USING product_id::text;

ALTER TABLE cart_items ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE cart_items ALTER COLUMN user_id    TYPE VARCHAR(7) USING user_id::text;
ALTER TABLE cart_items ALTER COLUMN product_id TYPE VARCHAR(7) USING product_id::text;

-- ── auth ──────────────────────────────────────────────────────────────────────
ALTER TABLE otp_verifications ALTER COLUMN id TYPE VARCHAR(7) USING id::text;

ALTER TABLE password_reset_tokens ALTER COLUMN id      TYPE VARCHAR(7) USING id::text;
ALTER TABLE password_reset_tokens ALTER COLUMN user_id TYPE VARCHAR(7) USING user_id::text;

ALTER TABLE refresh_tokens ALTER COLUMN id      TYPE VARCHAR(7) USING id::text;
ALTER TABLE refresh_tokens ALTER COLUMN user_id TYPE VARCHAR(7) USING user_id::text;

-- ── seller ────────────────────────────────────────────────────────────────────
ALTER TABLE seller_business_details ALTER COLUMN id      TYPE VARCHAR(7) USING id::text;
ALTER TABLE seller_business_details ALTER COLUMN user_id TYPE VARCHAR(7) USING user_id::text;

ALTER TABLE seller_bank_details ALTER COLUMN id      TYPE VARCHAR(7) USING id::text;
ALTER TABLE seller_bank_details ALTER COLUMN user_id TYPE VARCHAR(7) USING user_id::text;

ALTER TABLE seller_earnings ALTER COLUMN id        TYPE VARCHAR(7) USING id::text;
ALTER TABLE seller_earnings ALTER COLUMN seller_id TYPE VARCHAR(7) USING seller_id::text;
ALTER TABLE seller_earnings ALTER COLUMN order_id  TYPE VARCHAR(7) USING order_id::text;

ALTER TABLE seller_payouts ALTER COLUMN id        TYPE VARCHAR(7) USING id::text;
ALTER TABLE seller_payouts ALTER COLUMN seller_id TYPE VARCHAR(7) USING seller_id::text;

-- ── payments ──────────────────────────────────────────────────────────────────
ALTER TABLE payments ALTER COLUMN id       TYPE VARCHAR(7) USING id::text;
ALTER TABLE payments ALTER COLUMN order_id TYPE VARCHAR(7) USING order_id::text;
ALTER TABLE payments ALTER COLUMN user_id  TYPE VARCHAR(7) USING user_id::text;

ALTER TABLE refunds ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE refunds ALTER COLUMN payment_id TYPE VARCHAR(7) USING payment_id::text;

-- ── coupons ───────────────────────────────────────────────────────────────────
ALTER TABLE coupons ALTER COLUMN id TYPE VARCHAR(7) USING id::text;

-- ── delivery ──────────────────────────────────────────────────────────────────
ALTER TABLE delivery_partner_earnings ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE delivery_partner_earnings ALTER COLUMN partner_id TYPE VARCHAR(7) USING partner_id::text;
ALTER TABLE delivery_partner_earnings ALTER COLUMN order_id   TYPE VARCHAR(7) USING order_id::text;

ALTER TABLE delivery_issues ALTER COLUMN id         TYPE VARCHAR(7) USING id::text;
ALTER TABLE delivery_issues ALTER COLUMN order_id   TYPE VARCHAR(7) USING order_id::text;
ALTER TABLE delivery_issues ALTER COLUMN partner_id TYPE VARCHAR(7) USING partner_id::text;

-- Verify
SELECT table_name, column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE column_name = 'id'
  AND table_name IN (
    'users','products','orders','order_items','order_status_history',
    'notifications','categories','coupons','cart_items'
  )
ORDER BY table_name;
