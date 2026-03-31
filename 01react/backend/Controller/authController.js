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
    const { userName, name, mobile, email, password, userRole } = req.body;

    // Validation
    if (!userName || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = await createUser({
      userName,
      name,
      mobile,
      email,
      password,
      userRole: userRole || 'customer',
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

// Google OAuth callback handler
export const googleCallback = async (req, res) => {
  try {
    // User is attached by passport
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Block suspended accounts
    if (!user.is_active) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_suspended`);
    }

    // Generate tokens
    const token = generateToken(user.id, user.user_role);
    const refreshToken = generateRefreshToken(user.id);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
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
