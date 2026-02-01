const DeliveryUserDetail = require('../Model/deliveryUserDetailModel');
const DeliveryPartner = require('../Model/deliveryPartnerModel');
const Credential = require('../Model/credentialsModel');
const cloudinary = require('../config/cloudinary');

// Create delivery partner profile details
const createDeliveryProfile = async (req, res) => {
  try {
    const { dob, gender, personalAddress, aadharNumber, drivingLicense, emergencyContact, bankAccountNumber, ifscCode, preferences } = req.body;
    const userId = req.user.id;

    // Check if user exists and is delivery partner
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if profile already exists
    const existingProfile = await DeliveryUserDetail.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: 'Profile already exists' });
    }

    let profileImageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'delivery_profiles',
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
      });
      profileImageUrl = result.secure_url;
    }

    const deliveryProfile = new DeliveryUserDetail({
      userId,
      dob,
      gender,
      personalAddress,
      aadharNumber,
      drivingLicense,
      emergencyContact,
      bankAccountNumber,
      ifscCode,
      profileImage: profileImageUrl,
      preferences: preferences || {}
    });

    await deliveryProfile.save();

    res.status(201).json({
      success: true,
      message: 'Delivery partner profile created successfully',
      data: deliveryProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create delivery partner work details
const createDeliveryPartnerDetails = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber } = req.body;
    const userId = req.user.id;

    // Check if user exists and is delivery partner
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const partnerDetails = new DeliveryPartner({
      userId,
      vehicleType,
      vehicleNumber
    });

    await partnerDetails.save();

    res.status(201).json({
      success: true,
      message: 'Delivery partner details created successfully',
      data: partnerDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery partner location
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    const updatedPartner = await DeliveryPartner.findOneAndUpdate(
      { userId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery partner status
const updateStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user.id;

    const updatedPartner = await DeliveryPartner.findOneAndUpdate(
      { userId },
      { isOnline },
      { new: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      isOnline: updatedPartner.isOnline
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get delivery partner complete profile
const getDeliveryProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [profile, partnerDetails] = await Promise.all([
      DeliveryUserDetail.findOne({ userId }).populate('userId', 'userName name email mobile'),
      DeliveryPartner.findOne({ userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        profile,
        partnerDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDeliveryProfile,
  createDeliveryPartnerDetails,
  updateLocation,
  updateStatus,
  getDeliveryProfile
};