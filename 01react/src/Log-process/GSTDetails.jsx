import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

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
      // Update business details with GST and PAN
      await API.post('/users/seller/business-details', {
        businessName: registeredName,
        businessDescription: '',
        businessType,
        gstNo: gstNumber.toUpperCase(),
        panNo: panNumber.toUpperCase(),
        address: '',
        city: '',
        state: '',
        pincode: ''
      });

      setMessage('GST & PAN details saved! Proceeding...');
      setTimeout(() => navigate('/bank'), 1200);

    } catch (err) {
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save GST details. Please try again.';
      setError(typeof raw === 'object' ? JSON.stringify(raw) : String(raw));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/logo2.jpeg" alt="ZPIN Logo" className="h-16 w-auto" />
        </div>

        {/* Step progress bar — step 4 active */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Account', 'Business', 'GST', 'Bank'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 3
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : i < 3
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                  {i < 3 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${i === 3 ? 'text-amber-600' : i < 3 ? 'text-green-600' : 'text-gray-400'
                  }`}>{step}</span>
              </div>
              {i < 4 && (
                <div className={`h-0.5 w-6 mb-3 rounded ${i < 3 ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1 text-amber-600">
          GST &amp; Tax Information
        </h1>
        <p className="text-center text-gray-500 text-sm mb-5">
          Step 4 of 5 — Enter your GST &amp; PAN details
        </p>

        {/* Error banner */}
        {error && (
          <div className="mb-4 text-center text-sm text-red-700 bg-red-50 border border-red-300 rounded-lg py-3 px-3 space-y-2">
            <p>{error}</p>
            {(error.includes('403') || error.includes('session')) && (
              <button type="button" onClick={() => navigate('/login')}
                className="mt-1 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition">
                Go to Login →
              </button>
            )}
          </div>
        )}

        {/* Success banner */}
        {message && (
          <div className="mb-4 text-center text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg py-2 px-3">
            ✅ {message}
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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </span>
            ) : 'Save & Continue →'}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/details')}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
          >
            ← Back
          </button>

        </form>

      </div>
    </div>
  );
}
