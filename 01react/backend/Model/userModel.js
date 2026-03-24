import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Find user by email
export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Find user by ID
export const getUserById = async (id) => {
  const query = `
    SELECT u.*, 
           cp.profile_image as customer_profile_image,
           sp.profile_image as seller_profile_image
    FROM users u
    LEFT JOIN customer_profiles cp ON u.id = cp.user_id
    LEFT JOIN seller_profiles sp ON u.id = sp.user_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Find user by Google ID
export const findUserByGoogleId = async (googleId) => {
  const query = 'SELECT * FROM users WHERE google_id = $1';
  const result = await pool.query(query, [googleId]);
  return result.rows[0];
};

// Create new user
export const createUser = async (userData) => {
  const {
    userName,
    name,
    mobile,
    email,
    password,
    userRole = 'customer',
    googleId = null,
    isVerified = false
  } = userData;

  // Hash password if provided
  let passwordHash = null;
  if (password) {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    passwordHash = await bcrypt.hash(password, salt);
  }

  const query = `
    INSERT INTO users (user_name, name, mobile, email, password_hash, user_role, google_id, is_verified)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, user_name, name, mobile, email, user_role, is_verified, created_at
  `;

  const values = [userName, name, mobile, email, passwordHash, userRole, googleId, isVerified];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Find or create user from Google OAuth
export const findOrCreateGoogleUser = async (googleData) => {
  const { googleId, email, name, profileImage, emailVerified } = googleData;

  // Check if user exists by Google ID
  let user = await findUserByGoogleId(googleId);
  
  if (user) {
    // Update last login or any other fields if needed
    return user;
  }

  // Check if user exists by email
  user = await findUserByEmail(email);
  
  if (user) {
    // Link Google account to existing user
    const updateQuery = 'UPDATE users SET google_id = $1, is_verified = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(updateQuery, [googleId, emailVerified || true, user.id]);
    return result.rows[0];
  }

  // Create new user
  const userName = email.split('@')[0] + '_' + Date.now();
  const newUser = await createUser({
    userName,
    name,
    mobile: null, // Will be added later during profile completion
    email,
    password: null, // No password for OAuth users
    userRole: 'customer',
    googleId,
    isVerified: emailVerified || true
  });

  // Create customer profile with Google profile image
  if (profileImage) {
    const profileQuery = `
      INSERT INTO customer_profiles (user_id, profile_image)
      VALUES ($1, $2)
    `;
    await pool.query(profileQuery, [newUser.id, profileImage]);
  }

  return newUser;
};

// Update user
export const updateUser = async (userId, updates) => {
  const allowedFields = ['user_name', 'name', 'mobile', 'email'];
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(userId);
  const query = `
    UPDATE users 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING id, user_name, name, mobile, email, user_role, is_verified, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Update password
export const updatePassword = async (userId, newPassword) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const query = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
  await pool.query(query, [passwordHash, userId]);
};

// Get user with profile details
export const getUserWithProfile = async (userId) => {
  const query = `
    SELECT 
      u.id, u.user_name, u.name, u.mobile, u.email, u.user_role, u.is_verified, u.created_at,
      CASE 
        WHEN u.user_role = 'customer' THEN row_to_json(cp.*)
        WHEN u.user_role = 'seller' THEN row_to_json(sp.*)
      END as profile
    FROM users u
    LEFT JOIN customer_profiles cp ON u.id = cp.user_id AND u.user_role = 'customer'
    LEFT JOIN seller_profiles sp ON u.id = sp.user_id AND u.user_role = 'seller'
    WHERE u.id = $1
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
