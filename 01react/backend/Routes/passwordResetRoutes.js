import express from 'express';
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
  resendOTP
} from '../Controller/passwordResetController.js';

const router = express.Router();

// Request password reset (send OTP)
router.post('/request', requestPasswordReset);

// Verify OTP
router.post('/verify-otp', verifyResetOTP);

// Reset password with verified token
router.post('/reset', resetPassword);

// Resend OTP
router.post('/resend-otp', resendOTP);

export default router;
