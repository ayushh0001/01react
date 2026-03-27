import { pool } from '../config/database.js';
import crypto from 'crypto';

// In-memory OTP store: mobile -> { otp, expiresAt, attempts }
const otpStore = new Map();

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const isDev = () => process.env.NODE_ENV !== 'production';

// Send OTP to mobile number
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required' });
    }

    // Check if mobile already registered
    const { rows } = await pool.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Mobile number already registered' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(mobile, { otp, expiresAt, attempts: 0 });

    // Log OTP to server console (visible in terminal)
    console.log(`\n📱 OTP for +91${mobile}: ${otp} (expires in 10 min)\n`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      ...(isDev() && { otp }), // return OTP in dev for testing
    });
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
    }

    const stored = otpStore.get(mobile);

    if (!stored) {
      return res.status(400).json({ success: false, error: 'OTP not found or expired. Please request a new OTP.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new OTP.' });
    }

    if (stored.attempts >= 3) {
      otpStore.delete(mobile);
      return res.status(400).json({ success: false, error: 'Too many attempts. Please request a new OTP.' });
    }

    if (stored.otp !== otp) {
      stored.attempts += 1;
      otpStore.set(mobile, stored);
      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${3 - stored.attempts} attempt${3 - stored.attempts !== 1 ? 's' : ''} remaining.`
      });
    }

    otpStore.delete(mobile);
    res.json({ success: true, message: 'Phone number verified successfully', data: { mobile, verified: true } });
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
};

// Resend OTP with 30s cooldown
export const resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    const stored = otpStore.get(mobile);

    if (stored) {
      const elapsed = Date.now() - (stored.expiresAt - 10 * 60 * 1000);
      if (elapsed < 30 * 1000) {
        return res.status(429).json({
          success: false,
          error: 'Please wait before requesting a new OTP',
          retryAfter: Math.ceil((30 * 1000 - elapsed) / 1000)
        });
      }
    }

    return sendOTP(req, res);
  } catch (err) {
    console.error('resendOTP error:', err);
    res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
};
