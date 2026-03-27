import admin from 'firebase-admin';

// Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace \n in the private key (env vars flatten newlines)
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * POST /api/v1/auth/verify-firebase-phone
 * Body: { phone: "+919876543210", idToken: "firebase_id_token" }
 *
 * Verifies the Firebase ID token, confirms the phone number matches,
 * then stores the verified phone in session so the next step (create-account)
 * can use it.
 */
export const verifyFirebasePhone = async (req, res) => {
  const { phone, idToken } = req.body;

  if (!phone || !idToken) {
    return res.status(400).json({ success: false, error: 'phone and idToken are required' });
  }

  try {
    // Verify the token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Confirm the phone in the token matches what the user entered
    if (decoded.phone_number !== phone) {
      return res.status(400).json({ success: false, error: 'Phone number mismatch' });
    }

    // Store verified phone in session for the next signup step
    if (req.session) {
      req.session.verifiedPhone = phone;
    }

    return res.json({ success: true, phone });
  } catch (err) {
    console.error('Firebase token verification failed:', err.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
