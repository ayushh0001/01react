const ShippingAddress = require('../Model/shippingAddressModel');
const Credential = require('../Model/credentialsModel');

// Create shipping address
const createShippingAddress = async (req, res) => {
  try {
    const { name, phone, addressLine1, addressLine2, city, state, pincode, country, landmark, label, coordinates, isDefault } = req.body;
    const userId = req.user.id;

    // Check if user exists and is customer
    const user = await Credential.findById(userId);
    if (!user || user.userRole !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await ShippingAddress.updateMany(
        { userId },
        { isDefault: false }
      );
    }

    const shippingAddress = new ShippingAddress({
      userId,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country: country || 'India',
      landmark,
      label: label || 'home',
      coordinates: {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude]
      },
      isDefault: isDefault || false
    });

    await shippingAddress.save();

    res.status(201).json({
      success: true,
      message: 'Shipping address created successfully',
      data: shippingAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all shipping addresses for user
const getShippingAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const addresses = await ShippingAddress.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get specific shipping address
const getShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const address = await ShippingAddress.findOne({ _id: id, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update shipping address
const updateShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // If this is set as default, unset other default addresses
    if (updateData.isDefault) {
      await ShippingAddress.updateMany(
        { userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedAddress = await ShippingAddress.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete shipping address
const deleteShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedAddress = await ShippingAddress.findOneAndDelete({ _id: id, userId });
    if (!deletedAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createShippingAddress,
  getShippingAddresses,
  getShippingAddress,
  updateShippingAddress,
  deleteShippingAddress
};