import { pool } from '../config/database.js';
import crypto from 'crypto';
import twilio from 'twilio';

// Initialize Twilio client
let twilioClient = null;
let twilioEnabled = false;

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    twilioClient = twilio(accountSid, authToken);
    twilioEnabled = true;
    console.log('✅ Twilio SMS service initialized');
  } else {
    console.log('⚠️  Twilio credentials not found - using development mode (console logging)');
  }
} catch (error) {
  console.error('❌ Failed to initialize Twilio:', error.message);
  console.log('📝 Falling back to development mode (console logging)');
}

// In-memory OTP storage (for development)
// In production, use Redis or database with TTL
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send SMS via Twilio
const sendSMS = async (mobile, message) => {
  if (!twilioEnabled || !twilioClient) {
    // Development mode - log to console
    console.log(`\n📱 SMS to +91${mobile}:`);
    console.log(`📄 Message: ${message}\n`);
    return { success: true, mode: 'development' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`
    });

    console.log(`✅ SMS sent via Twilio to +91${mobile} (SID: ${result.sid})`);
    return { success: true, mode: 'production', sid: result.sid };
  } catch (error) {
    console.error('❌ Twilio SMS error:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Send OTP to mobile number
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validation
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile number is required'
      });
    }

    // Check if mobile already exists in database
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number already registered'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (in production, use Redis or database)
    otpStore.set(mobile, {
      otp,
      expiresAt,
      attempts: 0
    });

    // Send SMS via Twilio
    const smsMessage = `Your ZPIN verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    
    try {
      const smsResult = await sendSMS(mobile, smsMessage);
      
      console.log(`⏰ OTP expires at: ${new Date(expiresAt).toLocaleTimeString()}`);

      res.json({
        success: true,
        message: `OTP sent successfully to ${mobile}`,
        mode: smsResult.mode,
        // In development mode without Twilio, include OTP in response for testing
        ...(!twilioEnabled && process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (smsError) {
      // If SMS fails, remove OTP from store and return error
      otpStore.delete(mobile);
      throw smsError;
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      details: error.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Validation
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number and OTP are required'
      });
    }

    // Get stored OTP
    const storedData = otpStore.get(mobile);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check attempts (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(mobile, storedData);
      
      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`
      });
    }

    // OTP verified successfully
    otpStore.delete(mobile);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        mobile,
        verified: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      details: error.message
    });
  }
};

// Resend OTP (same as sendOTP but with rate limiting check)
export const resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Check if there's a recent OTP request (rate limiting)
    const storedData = otpStore.get(mobile);
    if (storedData) {
      const timeSinceLastOTP = Date.now() - (storedData.expiresAt - 10 * 60 * 1000);
      if (timeSinceLastOTP < 30 * 1000) { // 30 seconds cooldown
        return res.status(429).json({
          success: false,
          error: 'Please wait before requesting a new OTP',
          retryAfter: Math.ceil((30 * 1000 - timeSinceLastOTP) / 1000)
        });
      }
    }

    // Use the same sendOTP logic
    return sendOTP(req, res);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
};
