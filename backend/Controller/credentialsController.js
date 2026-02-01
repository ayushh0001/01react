const Credentialmodel = require("../Model/credentialsModel");
const UserDetailModel = require("../Model/userDetailModel");
const generateTokenAndSetCookie = require("../Service/tokenService");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await Credentialmodel.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(res, user);


    res.status(200).json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    console.error("Login route error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const signup = async (req, res) => {
  try {
    const { email, userName, name, mobile, userRole, password } = req.body;
    const formattedMobile = `+91${mobile}`;

    //check user
    const existingUser = await Credentialmodel.findOne({ email });

    //existing User
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email",
      });
    }
     if (userRole !== 'deliveryBoy' && !userName) {
      return res.status(400).json({ error: 'userName is required for non-deliveryBoy users' });
    }

    const signupdata = await new Credentialmodel({
      email,
      userName,
      name,
      mobile: formattedMobile,
      password,
      userRole,
      isVerified: true,
    }).save();

    try {
      generateTokenAndSetCookie(res, signupdata);
    } catch (tokenError) {
      await Credentialmodel.deleteOne({ _id: signupdata._id });
      throw tokenError;
    }

    const userObject = {
      id: signupdata._id,
      name: signupdata.name,
      mobile: signupdata.mobile,
      userName: signupdata.userName,
      email: signupdata.email,
      userRole: signupdata.userRole,
      isVerified: true,
      profileImage: signupdata.profileImage || null,
      timeStamp: signupdata.createdAt || new Date().toISOString(),
    };

    res.status(200).json(userObject);
  } catch (error) {
    console.error("Error saving Data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ success: false, message: "Logout failed, please try again" });
  }
};


const userDetail = async (req, res) => {
  try {
    const { dob, address, city, state, pincode, gender } = req.body;
    const userId = req.user.userId;

    let profileImageUrl = null;

    // Upload profile image if provided
    if (req.file) {
      const { uploadFromBuffer } = require('./uploadController');
      const uploadResult = await uploadFromBuffer(req.file.buffer, "ZPIN/profileImage");
      profileImageUrl = uploadResult.secure_url;
    }

    // Get coordinates from address using geocoding utility
    const { getCoordinatesFromPincode } = require('../utils/geocoding');
    const locationData = await getCoordinatesFromPincode(pincode, city, state);

    const userDetail = await new UserDetailModel({
      userId,
      dob,
      address,
      city,
      state,
      pincode,
      coordinates: {
        type: 'Point',
        coordinates: locationData.coordinates // [lng, lat]
      },
      gender,
      profileImage: profileImageUrl
    }).save();

    res.status(201).json({
      success: true,
      message: "User details saved successfully",
      data: userDetail
    });
  } catch (error) {
    console.error("Error saving user details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save user details"
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Credentialmodel.aggregate([
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "userDetails"
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Credentialmodel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "userDetails"
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user[0]
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
};

const updateProfileDetail = async (req, res) => {
  try {
    const { userName, name, dob, address, city, state, pincode, gender } = req.body;
    const userId = req.user.userId;

    let profileImageUrl = null;

    // Upload new profile image if provided
    if (req.file) {
      const { uploadFromBuffer } = require('./uploadController');
      const uploadResult = await uploadFromBuffer(req.file.buffer, "ZPIN/profileImage");
      profileImageUrl = uploadResult.secure_url;
    }

    // Update Credential model (userName, name)
    const credentialUpdate = {};
    if (userName) credentialUpdate.userName = userName;
    if (name) credentialUpdate.name = name;

    if (Object.keys(credentialUpdate).length > 0) {
      await Credentialmodel.findByIdAndUpdate(userId, credentialUpdate);
    }

    // Get coordinates from updated address
    const { getCoordinatesFromPincode } = require('../utils/geocoding');
    const locationData = await getCoordinatesFromPincode(pincode, city, state);

    // Update UserDetail model
    const userDetailUpdate = {
      dob,
      address,
      city,
      state,
      pincode,
      coordinates: {
        type: 'Point',
        coordinates: locationData.coordinates // [lng, lat]
      },
      gender
    };

    if (profileImageUrl) {
      userDetailUpdate.profileImage = profileImageUrl;
    }

    await UserDetailModel.findOneAndUpdate(
      { userId },
      userDetailUpdate,
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.log("Error in checkAuth controller", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
module.exports = {
  login,
  signup,
  logout,
  checkAuth,
  userDetail,
  getAllUsers,
  getUserById,
  updateProfileDetail,
};
