const Credentialmodel = require("../Model/credentialsModel");
const generateTokenAndSetCookie = require('../Service/tokenService')


const login = async (req, res) => {
  try {
  const { name, password } = req.body;



   // Find user by email or username
  const user = await Credentialmodel.findOne({
    $or: [{ email: name }, { username: name }]
  });

if (!user) {
  // User not found, send error and stop execution here
  return res.status(401).json({ error: 'User not found' });
}

      // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: "Invalid password" });





  // Generate JWT token and set cookie
      generateTokenAndSetCookie(res, user);



    res.json({ message: 'Logged in successfully' });
  } catch (err) {
   console.error('Login route error:', err);
    return res.status(500).json({ error: 'login fail, please try again' });
  }
};

const signup = async (req, res) => {
  try {
    const {email,username,yourname,mobile,address,role,password} = req.body;

    //check user
    const existingUser = await Credentialmodel.findOne({email});

    //existing User
    if (existingUser) {
      return res.status(200).send({
        success:true,
        message:'Already signup with this email please login'
      })
    }

    const signupdata = await new Credentialmodel({email,username,yourname,mobile,address,password,role}).save();

  try {
    generateTokenAndSetCookie(res, signupdata);
  } catch (tokenError) {
    await Credentialmodel.deleteOne({ _id: signupdata._id });
    throw tokenError;  // Let outer catch handle error response
  }

res.json({ success: true, message: "Signup successful" });
  } catch (error) {
    console.error("Error saving Data:", error);
    res.status(500).json({ success: false, message: "SignUp fail, please try again" });
  }
};

const logout = async(req,res)=>{
  try {
    res.clearCookie('token');
    res.json({message:"Logout successful"})
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success:false, message: 'Logout failed, please try again' });
  }

}


const forgetpassword = async(req,res)=>{
  try {
     const {mobile,newpassword} = req.body;
     const user = await Credentialmodel.findOne({mobile});
     if(!user){
      return res.status(404).json({message:"User not found with this mobile number"})
     }
      user.password = newpassword;
      await user.save();
      res.json({ success:true , message:"Password reset successful"})

  } catch (error) {
    console.error("Error in forgetpassword controller:", error);
    res.status(500).json({ success:false, message: 'Password reset failed, please try again' });
  }
}


const checkAuth = (req,res)=>{
  try {
    res.status(200).json(req.user);
  } catch (err) {
console.log("Error in checkAuth controller", err.message);
res.status(500).json({success:false, message:"Internal Server Error"})
  }
}
module.exports = { login, signup,logout,checkAuth,forgetpassword };
