/* 
 * DEVELOPMENT ONLY - PUBLIC LOCATION CONTROLLER
 * 
 * This controller is ONLY needed when you DON'T have Google Maps API key
 * 
 * WHEN YOU GET API KEY:
 * 1. Remove this entire file
 * 2. Remove publicLocationRoute.js
 * 3. Remove the route from index.js
 * 4. Frontend will use browser GPS directly
 * 
 * This is just a temporary solution for development phase
 */

const { getCoordinatesFromPincode } = require('../utils/geocoding');

// Convert user's pincode/city to coordinates (public endpoint)
// NOTE: This endpoint will be REMOVED when you have Google Maps API key
const getUserLocationCoordinates = async (req, res) => {
  try {
    const { pincode, city, state } = req.body;
    
    if (!pincode && !city) {
      return res.status(400).json({ 
        message: "Please provide either pincode or city" 
      });
    }

    // Use our fallback system to get coordinates
    const locationData = await getCoordinatesFromPincode(pincode, city, state);
    
    res.status(200).json({
      success: true,
      coordinates: locationData.coordinates,
      location: {
        city: city,
        state: state,
        pincode: pincode
      }
    });
  } catch (error) {
    console.error('Error getting user location:', error);
    res.status(500).json({ 
      message: "Error getting location coordinates" 
    });
  }
};

module.exports = { getUserLocationCoordinates };