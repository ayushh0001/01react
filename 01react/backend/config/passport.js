import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    // Import here to avoid circular dependency
    const { getUserById } = await import('../Model/userModel.js');
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Import here to avoid circular dependency
        const { findOrCreateGoogleUser } = await import('../Model/userModel.js');
        
        // Extract user data from Google profile
        const userData = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profileImage: profile.photos[0]?.value,
          emailVerified: profile.emails[0].verified
        };

        // Find or create user in database
        const user = await findOrCreateGoogleUser(userData);
        
        done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        done(error, null);
      }
    }
  )
);

export default passport;
