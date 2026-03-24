-- Add Google OAuth support to users table

-- Add google_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Create index on google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Make password_hash nullable for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Make mobile nullable for OAuth users (will be added during profile completion)
ALTER TABLE users ALTER COLUMN mobile DROP NOT NULL;

-- Add comments
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID';
COMMENT ON COLUMN users.password_hash IS 'Hashed password - NULL for OAuth-only users';

-- Verify changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'password_hash', 'mobile');

