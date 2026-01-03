// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

// Main Details component - handles business information collection
export default function Details() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State for form data - stores business information
  const [formData, setFormData] = useState({
    displayName: '',          // Business display name
    pickupPincode: '',        // Pickup location pincode
    businessDescription: ''   // Description of business activities
  });
  
  // State for validation messages
  const [error, setError] = useState('');      // Error message display
  const [message, setMessage] = useState('');  // Success message display
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Handle input field changes - updates form data state
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission and validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { displayName, pickupPincode, businessDescription } = formData;

    // Validation
    if (!displayName || !pickupPincode || !businessDescription) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^\d{6}$/.test(pickupPincode)) {
      setError('Please enter a valid 6-digit pickup pincode.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate profile details submission due to CORS issues
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Business details submitted successfully! (Demo mode)');
      setTimeout(() => {
        navigate('/gst-details');
      }, 1500);
    } catch (error) {
      console.error('Profile details error:', error);
      setError('Failed to save details. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Main container for business details form */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Business Details
        </h1>
        
        {/* Subtitle with instructions */}
        <p className="text-center text-gray-500 mb-4">
          Please provide some basic information about your business.
        </p>

        {/* Error message display */}
        {error && (
          <div className="mb-4 text-center text-sm text-red-700 bg-red-100 border border-red-400 rounded py-2">
            {error}
          </div>
        )}
        
        {/* Success message display */}
        {message && (
          <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-400 rounded py-2">
            {message}
          </div>
        )}

        {/* Business details form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Display name field */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Pickup pincode field - only allows digits, max 6 characters */}
          <div>
            <label htmlFor="pickupPincode" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Pincode
            </label>
            <input
              id="pickupPincode"
              name="pickupPincode"
              type="text"
              maxLength={6}
              value={formData.pickupPincode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pickupPincode: e.target.value.replace(/\D/g, '')  // Remove non-digits
                })
              }
              placeholder="Enter 6-digit pickup pincode"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Business description field - textarea for longer text */}
          <div>
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Business Description
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Write a short description about your business (what you sell, services provided, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold rounded-lg shadow-md transition duration-300 ${
              isLoading 
                ? 'bg-gray-500 cursor-not-allowed text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {isLoading ? 'Submitting...' : 'Submit Details'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
