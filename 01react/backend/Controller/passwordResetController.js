import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Ensure otp column exists (table already exists from schema migration)
const ensureTable = async () => {
  await pool.query(`
    ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS otp VARCHAR(6)
  `);
};

/** POST /password-reset/request — send OTP */
export const requestPasswordReset = async (req, res) => {
  try {
    await ensureTable();
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, error: 'Mobile number is required' });

    const { rows } = await pool.query(
      'SELECT id, email FROM users WHERE mobile = $1', [mobile]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'No account found with this mobile number' });

    const user = rows[0];

    // Rate limit: max 3 OTPs per 10 minutes
    const { rows: recent } = await pool.query(
      `SELECT COUNT(*) FROM password_reset_tokens
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '10 minutes'`, [user.id]
    );
    if (parseInt(recent[0].count) >= 3) {
      return res.status(429).json({ success: false, error: 'Too many requests. Try again in 10 minutes.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, otp, reset_token, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, otp, '', expiresAt]
    );

    // Log OTP to console (visible in server logs)
    console.log(`[Password Reset] OTP for ${mobile}: ${otp}`);

    // In dev mode return OTP in response for easy testing
    const isDev = process.env.NODE_ENV === 'development';
    res.json({
      success: true,
      message: isDev ? `OTP: ${otp} (dev mode)` : 'OTP sent to your registered mobile number',
      expiresIn: 600,
      ...(isDev && { otp }),
    });
  } catch (err) {
    console.error('[Password Reset] requestPasswordReset:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
};

/** POST /password-reset/verify-otp — verify OTP, return reset token */
export const verifyResetOTP = async (req, res) => {
  try {
    await ensureTable();
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });

    const { rows: users } = await pool.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (!users.length) return res.status(404).json({ success: false, error: 'User not found' });
    const userId = users[0].id;

    const { rows: tokens } = await pool.query(
      `SELECT id, expires_at, is_used FROM password_reset_tokens
       WHERE user_id = $1 AND otp = $2 AND is_used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [userId, otp]
    );

    if (!tokens.length) return res.status(400).json({ success: false, error: 'Invalid OTP' });

    const token = tokens[0];
    if (new Date() > new Date(token.expires_at)) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    // Generate a reset token and mark OTP as used
    const { rows: updated } = await pool.query(
      `UPDATE password_reset_tokens
       SET is_used = TRUE, reset_token = gen_random_uuid()::text
       WHERE id = $1 RETURNING reset_token`,
      [token.id]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: updated[0].reset_token,
    });
  } catch (err) {
    console.error('[Password Reset] verifyResetOTP:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
};

/** POST /password-reset/reset — set new password using Firebase idToken */
export const resetPassword = async (req, res) => {
  try {
    const { mobile, idToken, newPassword } = req.body;
    if (!mobile || !idToken || !newPassword) {
      return res.status(400).json({ success: false, error: 'mobile, idToken and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Verify Firebase ID token via Admin SDK
    const admin = await import('firebase-admin').then(m => m.default);
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired verification token. Please try again.' });
    }

    // Confirm the phone number in the token matches
    const expectedPhone = `+91${mobile}`;
    if (decoded.phone_number !== expectedPhone) {
      return res.status(400).json({ success: false, error: 'Phone number mismatch.' });
    }

    const { rows: users } = await pool.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (!users.length) return res.status(404).json({ success: false, error: 'No account found with this mobile number' });

    const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hash, users[0].id]
    );

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('[Password Reset] resetPassword:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
};

/** POST /password-reset/resend-otp */
export const resendOTP = async (req, res) => {
  try {
    await ensureTable();
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, error: 'Mobile number is required' });

    const { rows } = await pool.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'No account found with this mobile number' });
    const userId = rows[0].id;

    const { rows: recent } = await pool.query(
      `SELECT COUNT(*) FROM password_reset_tokens
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '10 minutes'`, [userId]
    );
    if (parseInt(recent[0].count) >= 3) {
      return res.status(429).json({ success: false, error: 'Too many requests. Try again in 10 minutes.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, otp, reset_token, expires_at) VALUES ($1, $2, $3, $4)',
      [userId, otp, '', expiresAt]
    );

    console.log(`[Password Reset] Resend OTP for ${mobile}: ${otp}`);
    const isDev = process.env.NODE_ENV === 'development';
    res.json({
      success: true,
      message: isDev ? `OTP: ${otp} (dev mode)` : 'OTP resent successfully',
      expiresIn: 600,
      ...(isDev && { otp }),
    });
  } catch (err) {
    console.error('[Password Reset] resendOTP:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
};
