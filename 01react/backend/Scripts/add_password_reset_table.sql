-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp ON password_reset_tokens(otp);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_password_reset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER password_reset_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_updated_at();

-- Clean up expired tokens (optional - can be run as a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens
    WHERE expires_at < CURRENT_TIMESTAMP
    OR (is_used = TRUE AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE password_reset_tokens IS 'Stores OTP tokens for password reset functionality';
COMMENT ON COLUMN password_reset_tokens.otp IS '6-digit OTP code sent to user email/phone';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'OTP expiration time (typically 10 minutes from creation)';
COMMENT ON COLUMN password_reset_tokens.is_used IS 'Flag to prevent OTP reuse';
