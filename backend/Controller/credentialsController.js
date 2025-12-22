const Credentialmodel = require("../Model/credentialsModel");
const UserDetailModel = require("../Model/userDetailModel");
const generateTokenAndSetCookie = require("../Service/tokenService");
const mongoose = require("mongoose");

/* ================= LOGIN ================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Credentialmodel.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    generateTokenAndSetCookie(res, user);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        userRole: user.userRole,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ================= SIGNUP ================= */
const signup = async (req, res) => {
  try {
    const { email, userName, name, mobile, userRole, password } = req.body;

    const formattedMobile = mobile ? `+91${mobile}` : undefined;

    const existingUser = await Credentialmodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const signupdata = await new Credentialmodel({
      email,
      userName,
      name,
      mobile: formattedMobile,
      password,
      userRole: userRole || "customer", // ✅ FIXED
    }).save();

    generateTokenAndSetCookie(res, signupdata);

    return res.status(201).json({
      success: true,
      user: {
        id: signupdata._id,
        email: signupdata.email,
        userName: signupdata.userName,
        name: signupdata.name,
        mobile: signupdata.mobile,
        userRole: signupdata.userRole,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/* ================= LOGOUT ================= */
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/* ================= CHECK AUTH ================= */
const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Auth check failed",
    });
  }
};

/* ================= USER DETAIL ================= */
const userDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dob, address, city, state, pincode, gender } = req.body;

    const detail = await UserDetailModel.create({
      userId,
      dob,
      address,
      city,
      state,
      pincode,
      gender,
      profileImage: null,
    });

    return res.status(201).json({
      success: true,
      message: "User details saved",
      data: detail,
    });
  } catch (error) {
    console.error("User detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save user details",
    });
  }
};

/* ================= UPDATE PROFILE ================= */
const updateProfileDetail = async (req, res) => {
  try {
    const userId = req.user.userId;

    await UserDetailModel.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

/* ================= GET USERS ================= */
const getAllUsers = async (req, res) => {
  try {
    const users = await Credentialmodel.find().select("-password");
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await Credentialmodel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/* ================= EXPORTS (🔥 IMPORTANT) ================= */
module.exports = {
  login,
  signup,
  logout,
  checkAuth,
  userDetail,
  updateProfileDetail,
  getAllUsers,
  getUserById,
};
