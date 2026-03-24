import express from 'express';
import passport from '../config/passport.js';
import {
  signup,
  login,
  googleCallback,
  getProfile,
  logout,
  refreshToken
} from '../Controller/authController.js';
import {
  sendOTP,
  verifyOTP,
  resendOTP
} from '../Controller/otpController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

// Traditional authentication
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken);

// OTP verification routes
router.post('/verification/sendOTP', sendOTP);
router.post('/verification/verifyOTP', verifyOTP);
router.post('/verification/resendOTP', resendOTP);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  googleCallback
);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
