import { 
  createUser, 
  findUserByEmail, 
  verifyPassword,
  getUserWithProfile 
} from '../Model/userModel.js';
import { generateToken, generateRefreshToken } from '../Middleware/auth.js';

// Traditional signup (email/password)
export const signup = async (req, res) => {
  try {
    let { userName, name, mobile, email, password, userRole } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    // Ensure userName is unique — auto-suffix if taken
    if (!userName) userName = email.split('@')[0];
    const { pool } = await import('../config/database.js');
    const taken = await pool.query('SELECT id FROM users WHERE user_name = $1', [userName]);
    if (taken.rows.length > 0) {
      userName = userName + '_' + Date.now().toString().slice(-5);
    }

    // Create user
    const user = await createUser({
      userName,
      name,
      mobile: mobile || null,
      email,
      password,
      userRole: userRole || 'seller',
      isVerified: false
    });

    // Generate tokens
    const token = generateToken(user.id, user.user_role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          userName: user.user_name,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          userRole: user.user_role,
          isVerified: user.is_verified
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    // Handle PostgreSQL unique constraint violations
    if (error.code === '23505') {
      const detail = error.detail || '';
      let message = 'An account with these details already exists.';
      if (detail.includes('email')) message = 'An account with this email already exists.';
      else if (detail.includes('user_name')) message = 'This username is already taken.';
      else if (detail.includes('mobile')) message = 'This phone number is already registered.';
      return res.status(400).json({ success: false, error: message });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      details: error.message
    });
  }
};

// Traditional login (email/password)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user has password (not OAuth-only user)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        error: 'Please login with Google',
        code: 'OAUTH_ONLY_USER'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact support at support@zpinshop.com.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.user_role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          userName: user.user_name,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          userRole: user.user_role,
          isVerified: user.is_verified
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
};

// Production frontend URL — hardcoded so Google OAuth callback always works
// even if FRONTEND_URL env var is misconfigured on the hosting platform
const PRODUCTION_FRONTEND_URL = 'https://www.zpinshop.com';

const getFrontendUrl = () => {
  const env = process.env.FRONTEND_URL || '';
  // Never redirect to localhost in any environment
  if (!env || env.includes('localhost') || env.includes('127.0.0.1')) {
    return PRODUCTION_FRONTEND_URL;
  }
  return env;
};

// Google OAuth callback handler
export const googleCallback = async (req, res) => {
  const frontendUrl = getFrontendUrl();
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    if (!user.is_active) {
      return res.redirect(`${frontendUrl}/login?error=account_suspended`);
    }

    const token = generateToken(user.id, user.user_role);
    const refreshToken = generateRefreshToken(user.id);

    res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${frontendUrl}/login?error=server_error`);
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await getUserWithProfile(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        userName: user.user_name,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        userRole: user.user_role,
        isVerified: user.is_verified,
        profile: user.profile,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // Here you could add token to a blacklist if needed
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await getUserById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id, user.user_role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};
