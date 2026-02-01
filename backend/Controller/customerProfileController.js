const CustomerUserDetail = require('../Model/customerUserDetailModel');
const Credential = require('../Model/credentialsModel');
const cloudinary = require('../config/cloudinary');

// Create customer profile details
const createCustomerProfile = async (req, res) => {
  try {
    const { dob, gender, preferences, accountType } = req.body;
    const userId = req.user.id;

    // Check if user exists and is customer
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if profile already exists
    const existingProfile = await CustomerUserDetail.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: 'Profile already exists' });
    }

    let profileImageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'customer_profiles',
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
      });
      profileImageUrl = result.secure_url;
    }

    const customerProfile = new CustomerUserDetail({
      userId,
      dob,
      gender,
      profileImage: profileImageUrl,
      preferences: preferences || {},
      accountType: accountType || 'basic'
    });

    await customerProfile.save();

    res.status(201).json({
      success: true,
      message: 'Customer profile created successfully',
      data: customerProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer profile
const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await CustomerUserDetail.findOne({ userId }).populate('userId', 'userName name email mobile');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update customer profile
const updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'customer_profiles',
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
      });
      updateData.profileImage = result.secure_url;
    }

    const updatedProfile = await CustomerUserDetail.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCustomerProfile,
  getCustomerProfile,
  updateCustomerProfile
};