import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GSTDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gstNumber: '',
    businessType: '',
    registeredName: '',
    panNumber: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { gstNumber, businessType, registeredName, panNumber } = formData;

    // Validation
    if (!gstNumber || !businessType || !registeredName || !panNumber) {
      setError('All fields are required.');
      return;
    }

    // Validate GSTIN (15 character alphanumeric)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber.toUpperCase())) {
      setError('Please enter a valid GST number.');
      return;
    }

    // Validate PAN number (10 character alpha-numeric)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      setError('Please enter a valid PAN number.');
      return;
    }

    setMessage('GST details submitted successfully!');
    setTimeout(() => navigate('/bank'), 1500); // redirect to bank details page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">GST & Tax Information</h1>
        <p className="text-center text-gray-500 mb-4">
          Please enter your GST details carefully. These details are required for invoice generation.
        </p>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 text-center text-sm text-red-700 bg-red-100 border border-red-400 rounded py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-400 rounded py-2">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })
              }
              placeholder="Enter 15-character GSTIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

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
                setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })
              }
              placeholder="ABCDE1234F"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
          >
            Submit GST Info
          </button>
        </form>
      </div>
    </div>
  );
}
