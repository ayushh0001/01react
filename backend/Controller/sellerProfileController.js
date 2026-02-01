const SellerUserDetail = require('../Model/sellerUserDetailModel');
const SellerDetail = require('../Model/businessDetailModel');
const SellerBankDetail = require('../Model/sellerBankDetailModel');
const Credential = require('../Model/credentialsModel');
const cloudinary = require('../config/cloudinary');

// Create seller profile details
const createSellerProfile = async (req, res) => {
  try {
    const { dob, gender, personalAddress, emergencyContact, personalPanNo, preferences } = req.body;
    const userId = req.user.id;

    // Check if user exists and is seller
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'seller') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if profile already exists
    const existingProfile = await SellerUserDetail.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: 'Profile already exists' });
    }

    let profileImageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'seller_profiles',
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
      });
      profileImageUrl = result.secure_url;
    }

    const sellerProfile = new SellerUserDetail({
      userId,
      dob,
      gender,
      personalAddress,
      emergencyContact,
      personalPanNo,
      profileImage: profileImageUrl,
      preferences: preferences || {}
    });

    await sellerProfile.save();

    res.status(201).json({
      success: true,
      message: 'Seller profile created successfully',
      data: sellerProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create seller business details
const createSellerBusinessDetails = async (req, res) => {
  try {
    const { businessName, businessDescription, businessType, gstNo, panNo, address, city, state, pincode } = req.body;
    const userId = req.user.id;

    // Check if user exists and is seller
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'seller') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const businessDetails = new SellerDetail({
      userId,
      businessName,
      businessDescription,
      businessType,
      gstNo,
      panNo,
      address,
      city,
      state,
      pincode
    });

    await businessDetails.save();

    res.status(201).json({
      success: true,
      message: 'Business details created successfully',
      data: businessDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create seller bank details
const createSellerBankDetails = async (req, res) => {
  try {
    const { bankName, accountNo, accountHolderName, accountType, ifscCode } = req.body;
    const userId = req.user.id;

    // Check if user exists and is seller
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'seller') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const bankDetails = new SellerBankDetail({
      sellerId: userId,
      bankName,
      accountNo,
      accountHolderName,
      accountType,
      ifscCode
    });

    await bankDetails.save();

    res.status(201).json({
      success: true,
      message: 'Bank details created successfully',
      data: bankDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get seller complete profile
const getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [profile, businessDetails, bankDetails] = await Promise.all([
      SellerUserDetail.findOne({ userId }).populate('userId', 'userName name email mobile'),
      SellerDetail.findOne({ userId }),
      SellerBankDetail.findOne({ sellerId: userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        profile,
        businessDetails,
        bankDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSellerProfile,
  createSellerBusinessDetails,
  createSellerBankDetails,
  getSellerProfile
};