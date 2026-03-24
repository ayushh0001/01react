import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request password reset - Send OTP to user's mobile
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number is required'
      });
    }

    // Check if user exists
    const userQuery = 'SELECT id, email, mobile, user_name FROM users WHERE mobile = $1';
    const userResult = await pool.query(userQuery, [mobile]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this mobile number'
      });
    }

    const user = userResult.rows[0];

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const insertQuery = `
      INSERT INTO password_reset_tokens (user_id, email, otp, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    await pool.query(insertQuery, [user.id, user.email, otp, expiresAt]);

    // Send OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Zpin Shop password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobile
      });

      console.log(`[Password Reset] OTP sent to ${mobile}: ${otp}`);

      res.json({
        success: true,
        message: 'OTP sent successfully to your mobile number',
        mobile: mobile,
        expiresIn: 600 // 10 minutes in seconds
      });
    } catch (twilioError) {
      console.error('[Password Reset] Twilio error:', twilioError);
      
      // For development, return OTP in response if Twilio fails
      if (process.env.NODE_ENV === 'development') {
        res.json({
          success: true,
          message: 'OTP generated (Twilio unavailable in dev)',
          mobile: mobile,
          otp: otp, // Only in development!
          expiresIn: 600
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send OTP. Please try again.'
        });
      }
    }
  } catch (error) {
    console.error('[Password Reset] Error requesting reset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
      message: error.message
    });
  }
};

/**
 * Verify OTP
 */
export const verifyResetOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number and OTP are required'
      });
    }

    // Find user
    const userQuery = 'SELECT id FROM users WHERE mobile = $1';
    const userResult = await pool.query(userQuery, [mobile]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userId = userResult.rows[0].id;

    // Verify OTP
    const otpQuery = `
      SELECT id, expires_at, is_used
      FROM password_reset_tokens
      WHERE user_id = $1 AND otp = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const otpResult = await pool.query(otpQuery, [userId, otp]);

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    const token = otpResult.rows[0];

    // Check if OTP is expired
    if (new Date() > new Date(token.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP is already used
    if (token.is_used) {
      return res.status(400).json({
        success: false,
        error: 'OTP has already been used'
      });
    }

    // Mark OTP as used
    await pool.query(
      'UPDATE password_reset_tokens SET is_used = TRUE WHERE id = $1',
      [token.id]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: token.id // Use this token to reset password
    });
  } catch (error) {
    console.error('[Password Reset] Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      message: error.message
    });
  }
};

/**
 * Reset password with verified token
 */
export const resetPassword = async (req, res) => {
  try {
    const { mobile, resetToken, newPassword } = req.body;

    if (!mobile || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number, reset token, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find user
    const userQuery = 'SELECT id FROM users WHERE mobile = $1';
    const userResult = await pool.query(userQuery, [mobile]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userId = userResult.rows[0].id;

    // Verify reset token
    const tokenQuery = `
      SELECT id, expires_at, is_used
      FROM password_reset_tokens
      WHERE id = $1 AND user_id = $2 AND is_used = TRUE
    `;
    const tokenResult = await pool.query(tokenQuery, [resetToken, userId]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const token = tokenResult.rows[0];

    // Check if token is still valid (within 30 minutes of verification)
    const tokenAge = Date.now() - new Date(token.expires_at).getTime();
    if (tokenAge > 30 * 60 * 1000) { // 30 minutes
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired. Please request a new OTP.'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    // Delete all password reset tokens for this user
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [userId]
    );

    console.log(`[Password Reset] Password reset successful for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('[Password Reset] Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      message: error.message
    });
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number is required'
      });
    }

    // Check if user exists
    const userQuery = 'SELECT id, email FROM users WHERE mobile = $1';
    const userResult = await pool.query(userQuery, [mobile]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this mobile number'
      });
    }

    const user = userResult.rows[0];

    // Check rate limiting (max 3 OTPs per 10 minutes)
    const recentOTPsQuery = `
      SELECT COUNT(*) as count
      FROM password_reset_tokens
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    const recentOTPs = await pool.query(recentOTPsQuery, [user.id]);

    if (parseInt(recentOTPs.rows[0].count) >= 3) {
      return res.status(429).json({
        success: false,
        error: 'Too many OTP requests. Please try again after 10 minutes.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, email, otp, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, otp, expiresAt]
    );

    // Send OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Zpin Shop password reset OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobile
      });

      res.json({
        success: true,
        message: 'OTP resent successfully',
        expiresIn: 600
      });
    } catch (twilioError) {
      console.error('[Password Reset] Twilio error on resend:', twilioError);
      
      if (process.env.NODE_ENV === 'development') {
        res.json({
          success: true,
          message: 'OTP generated (Twilio unavailable)',
          otp: otp,
          expiresIn: 600
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send OTP'
        });
      }
    }
  } catch (error) {
    console.error('[Password Reset] Error resending OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend OTP',
      message: error.message
    });
  }
};
