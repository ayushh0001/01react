const LocationModel = require("../Model/locationModel");

// Get all addresses for authenticated user
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await LocationModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

// Get specific address by ID
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const address = await LocationModel.findOne({ _id: id, userId });
    
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ error: "Failed to fetch address" });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, name, mobile, address, landmark, city, state, pincode, isDefault } = req.body;
    
    // Validate required fields
    if (!name || !mobile || !address || !city || !state || !pincode) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }
    
    const newAddress = new LocationModel({
      userId,
      type,
      name,
      mobile,
      address,
      landmark,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    });
    
    await newAddress.save();
    
    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress
    });
  } catch (error) {
    console.error("Error adding address:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to add address" });
  }
};

// Update existing address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    
    const address = await LocationModel.findOne({ _id: id, userId });
    
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    const updatedAddress = await LocationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress
    });
  } catch (error) {
    console.error("Error updating address:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update address" });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const address = await LocationModel.findOne({ _id: id, userId });
    
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    await LocationModel.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: "Failed to delete address" });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const address = await LocationModel.findOne({ _id: id, userId });
    
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    // Remove default from all other addresses
    await LocationModel.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );
    
    // Set this address as default
    await LocationModel.findByIdAndUpdate(id, { isDefault: true });
    
    res.status(200).json({
      success: true,
      message: "Default address updated successfully"
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ error: "Failed to set default address" });
  }
};

// Check pincode serviceability
const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Invalid pincode format" });
    }
    
    // For now, return serviceable for all valid pincodes
    // In production, integrate with actual delivery service API
    const serviceableStates = [
      "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", 
      "Rajasthan", "Uttar Pradesh", "West Bengal", "Haryana", "Punjab"
    ];
    
    res.status(200).json({
      success: true,
      pincode,
      serviceable: true,
      estimatedDelivery: "3-5 business days",
      codAvailable: true,
      message: "Delivery available in this area"
    });
  } catch (error) {
    console.error("Error checking pincode:", error);
    res.status(500).json({ error: "Failed to check pincode serviceability" });
  }
};

module.exports = {
  getUserAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  checkPincode
};