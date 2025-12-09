const twilio = require('twilio');
// const jwt = require('jsonwebtoken')


const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // it is required for twilio service api

const client = new twilio(accountSid,authToken)



        // By twilio service API


 const sendOTP = async(req, res)=> {
  const { phone } = req.body;
  try {
    await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: phone, channel: 'sms' });

    res.json({ success: true });
  } catch (error) {
      console.error('Twilio Verify Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}


const verifyOTP = async (req, res)=> {
  const { phone, otp } = req.body;
  try {
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: phone, code: otp });

    if (verificationCheck.status === 'approved') {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid code' });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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




module.exports = {sendOTP,verifyOTP}