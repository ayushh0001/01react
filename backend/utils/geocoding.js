const axios = require('axios');

/* 
 * GEOCODING UTILITY - WORKS WITH OR WITHOUT API KEY
 * 
 * WITHOUT API KEY (Development):
 * - Uses fallback coordinates for major cities
 * - Good enough for testing 25km radius functionality
 * 
 * WITH API KEY (Production):
 * - Gets precise coordinates from Google Maps
 * - Accurate street-level location data
 * 
 * The fallback system will ALWAYS be used as backup even with API key
 */

// Convert pincode to coordinates
const getCoordinatesFromPincode = async (pincode, city, state) => {
  try {
    // DEVELOPMENT MODE: Skip API call if no key provided - use fallback directly
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log('No Google Maps API key - using fallback coordinates');
      return getApproximateCoordinates(city, state, pincode);
    }

    // PRODUCTION MODE: Use Google Maps API for precise coordinates
    const address = `${pincode}, ${city}, ${state}, India`;
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        coordinates: [location.lng, location.lat], // [longitude, latitude] for MongoDB
        formatted_address: response.data.results[0].formatted_address
      };
    }
    
    throw new Error('No coordinates found for this address');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    // FALLBACK: Always use approximate coordinates if API fails
    return getApproximateCoordinates(city, state, pincode);
  }
};

// FALLBACK SYSTEM - Always keep this even with API key
// Enhanced fallback coordinates for Indian cities and pincodes
const getApproximateCoordinates = (city, state, pincode) => {
  // Major city coordinates
  const cityCoordinates = {
    'mumbai': [72.8777, 19.0760],
    'delhi': [77.1025, 28.7041],
    'bangalore': [77.5946, 12.9716],
    'hyderabad': [78.4867, 17.3850],
    'chennai': [80.2707, 13.0827],
    'kolkata': [88.3639, 22.5726],
    'pune': [73.8567, 18.5204],
    'ahmedabad': [72.5714, 23.0225],
    'jaipur': [75.7873, 26.9124],
    'surat': [72.8311, 21.1702],
    'lucknow': [80.9462, 26.8467],
    'kanpur': [80.3319, 26.4499],
    'nagpur': [79.0882, 21.1458],
    'indore': [75.8577, 22.7196],
    'thane': [72.9781, 19.2183],
    'bhopal': [77.4126, 23.2599],
    'visakhapatnam': [83.3018, 17.6868],
    'pimpri': [73.8067, 18.6298],
    'patna': [85.1376, 25.5941],
    'vadodara': [73.1812, 22.3072],
    'ghaziabad': [77.4538, 28.6692],
    'ludhiana': [75.8573, 30.9010],
    'agra': [78.0081, 27.1767],
    'nashik': [73.7898, 19.9975]
  };

  // Pincode-based approximate coordinates (first 3 digits)
  const pincodeRegions = {
    '110': [77.1025, 28.7041], // Delhi
    '400': [72.8777, 19.0760], // Mumbai
    '560': [77.5946, 12.9716], // Bangalore
    '500': [78.4867, 17.3850], // Hyderabad
    '600': [80.2707, 13.0827], // Chennai
    '700': [88.3639, 22.5726], // Kolkata
    '411': [73.8567, 18.5204], // Pune
    '380': [72.5714, 23.0225], // Ahmedabad
    '302': [75.7873, 26.9124], // Jaipur
    '395': [72.8311, 21.1702], // Surat
  };

  // Try city match first
  const cityKey = city.toLowerCase();
  if (cityCoordinates[cityKey]) {
    return { coordinates: cityCoordinates[cityKey] };
  }

  // Try pincode region match
  if (pincode && pincode.length >= 3) {
    const pincodePrefix = pincode.substring(0, 3);
    if (pincodeRegions[pincodePrefix]) {
      return { coordinates: pincodeRegions[pincodePrefix] };
    }
  }

  // Default to Mumbai
  return { coordinates: [72.8777, 19.0760] };
};

module.exports = { getCoordinatesFromPincode };