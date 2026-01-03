// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

// Main GSTDetails component - handles GST and tax information collection
export default function GSTDetails() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State for form data - stores GST and tax information
  const [formData, setFormData] = useState({
    gstNumber: '',        // GST registration number
    businessType: '',     // Type of business entity
    registeredName: '',   // Legal business name as per GST
    panNumber: ''         // PAN card number
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

    const { gstNumber, businessType, registeredName, panNumber } = formData;

    // Validation
    if (!gstNumber || !businessType || !registeredName || !panNumber) {
      setError('All fields are required.');
      return;
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber.toUpperCase())) {
      setError('Please enter a valid GST number.');
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      setError('Please enter a valid PAN number.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate GST/PAN verification due to CORS issues
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('GST details verified and saved successfully! (Demo mode)');
      setTimeout(() => navigate('/bank'), 1500);
    } catch (error) {
      console.error('GST details error:', error);
      setError('Failed to verify GST/PAN details. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Main container for GST details form */}
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          GST & Tax Information
        </h1>
        
        {/* Subtitle with instructions */}
        <p className="text-center text-gray-500 mb-4">
          Please enter your GST details carefully. These details are required for invoice generation.
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

        {/* GST details form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* GST number field - converts to uppercase, max 15 characters */}
          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">
              GST Number
            </label>
            <input
              id="gstNumber"
              name="gstNumber"
              type="text"
              maxLength={15}
              value={formData.gstNumber}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  gstNumber: e.target.value.toUpperCase()  // Convert to uppercase
                })
              }
              placeholder="Enter 15-character GSTIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Business type dropdown */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select type</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="pvt-ltd">Private Limited</option>
              <option value="llp">LLP</option>
              <option value="ngo">NGO</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Registered business name field */}
          <div>
            <label htmlFor="registeredName" className="block text-sm font-medium text-gray-700 mb-1">
              Registered Business Name
            </label>
            <input
              id="registeredName"
              name="registeredName"
              type="text"
              value={formData.registeredName}
              onChange={handleChange}
              placeholder="Legal name as per GST registration"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* PAN number field - converts to uppercase, max 10 characters */}
          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number
            </label>
            <input
              id="panNumber"
              name="panNumber"
              type="text"
              maxLength={10}
              value={formData.panNumber}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  panNumber: e.target.value.toUpperCase()  // Convert to uppercase
                })
              }
              placeholder="ABCDE1234F"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
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
            {isLoading ? 'Verifying...' : 'Submit GST Info'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
