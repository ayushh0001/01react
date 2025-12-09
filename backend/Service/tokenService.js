const jwt = require('jsonwebtoken');



const generateTokenAndSetCookie = (res, user) => {
  try {
    const payload = { userId: user._id.toString(), email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
  } catch (error) {
    throw error; // Re-throw the error to be caught by the caller
  }
};

module.exports = generateTokenAndSetCookie