const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Credentialmodel = require("../Model/credentialsModel");
const generateTokenAndSetCookie = require('../Service/tokenService');

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // it is required for twilio service api

const client = new twilio(accountSid,authToken)



        // By twilio service API


 const sendOTP = async(req, res)=> {
  const { mobile } = req.body;
  const formattedMobile = `+91${mobile}`;
  try {
    await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: formattedMobile, channel: 'sms' });

    res.json({ success: true });
  } catch (error) {
      console.error('Twilio Verify Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}


const verifyOTP = async (req, res)=> {
  const { mobile, otp } = req.body;

  if (!mobile) {
    return res.status(404).json({ error: "Mobile number not found" });
  }

  if (!otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const formattedMobile = `+91${mobile}`;

  try {
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: formattedMobile, code: otp });

    if (verificationCheck.status === 'approved') {
      console.log('OTP verification successful');
      res.json({ message: "OTP verified successfully" });
    } else {
      console.log('OTP verification failed, status:', verificationCheck.status);
      res.status(400).json({ error: "Invalid OTP" });
    }

  } catch (error) {
    console.error('Twilio Verify OTP Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// JWT-based reset tokens (stateless, no storage needed)

// Dedicated forget password functions
const forgetPasswordSendOTP = async(req, res) => {
  try {
    const { mobile, email } = req.body;
    const formattedMobile = `+91${mobile}`;

    if (!mobile || !email) {
      return res.status(400).json({ error: "Mobile and email are required" });
    }

    // Check if user exists with both mobile and email
    const user = await Credentialmodel.findOne({ 
      mobile: formattedMobile, 
      email: email 
    });
    
    if (!user) {
      return res.status(404).json({ error: "No account found with this mobile and email combination" });
    }

    // Use existing Twilio service to send OTP
    await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: formattedMobile, channel: 'sms' });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in forgetPasswordSendOTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const forgetPasswordVerifyOTP = async(req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    const formattedMobile = `+91${mobile}`;

    if (!mobile || !email || !otp) {
      return res.status(400).json({ error: "Mobile, email and OTP are required" });
    }

    // Use existing Twilio service to verify OTP
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: formattedMobile, code: otp });

    if (verificationCheck.status === 'approved') {
      // Find user to get userId for JWT payload
      const user = await Credentialmodel.findOne({ 
        mobile: formattedMobile, 
        email: email 
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate JWT reset token with user data
      const resetToken = jwt.sign(
        {
          userId: user._id.toString(),
          mobile: formattedMobile,
          email: email,
          purpose: 'password-reset'
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // 10 minutes
      );

      res.status(200).json({
        message: "OTP verified successfully",
        resetToken
      });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in forgetPasswordVerifyOTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const forgetPasswordResetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required" });
    }

    // Verify JWT token and extract user data
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Verify token purpose
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: "Invalid token purpose" });
    }

    // Hash password manually (same as model's pre-save middleware)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update only password field without triggering full validation
    const user = await Credentialmodel.findOneAndUpdate(
      { 
        _id: decoded.userId,
        mobile: decoded.mobile,
        email: decoded.email 
      },
      { password: hashedPassword },
      { new: true } // Return updated document
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Generate auth token and set cookie (auto-login after password reset)
    generateTokenAndSetCookie(res, user);

    res.status(200).json({ 
      message: "Password reset successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        userRole: user.userRole
      }
    });
  } catch (error) {
    console.error("Error in forgetPasswordResetPassword:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  forgetPasswordSendOTP,
  forgetPasswordVerifyOTP,
  forgetPasswordResetPassword
}






















        //Manually by twilio sms service

// const sendOTP = async(req,res)=>{
//     try {
//         const {phone} = req.body;
//     const code = Math.floor(100000 + Math.random() * 900000); // Generate a 4-digit code
//     const message = `Thanks for choosing Zipin. \n Your mobile verification code is: ${code}`;


//     //sending code via sms
//         await client.messages.create({
//             body:message,
//             from: process.env.TWILIO_PHONE_NUMBER,
//             to: phone
//         });


//      // Creating JWT
//     const payload = {
//       phone,
//       code,
//       exp: Math.floor(Date.now() / 1000) + 300 // 5 min expiry
//     };
//     const token = jwt.sign(payload, process.env.JWT_SECRET);
//     // Send JWT to client
//     return res.json({ token });
//       } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to send OTP' });
//   }
// }



// const verifyOTP = (req, res) => {
//   const { token, otp } = req.body;
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     if (payload.code == otp && payload.exp > Math.floor(Date.now() / 1000)) {
//       // Verified
//       res.json({ success: true });
//     } else {
//       res.status(400).json({ success: false, error: 'Invalid or expired code' });
//     }
//   } catch (err) {
//     res.status(400).json({ success: false, error: 'Invalid token' });
//   }
// };




