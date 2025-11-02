import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Details() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
 
    displayName: '',
    pickupPincode: '',
    businessDescription: ''
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

    const { displayName, pickupPincode, businessDescription } = formData;

    // Step 1: Check all fields filled
    if ( !displayName || !pickupPincode || !businessDescription) {
      setError('Please fill in all fields.');
      return;
    }

    // Step 2: Validate 6-digit numeric pincode
    if (!/^\d{6}$/.test(pickupPincode)) {
      setError('Please enter a valid 6-digit pickup pincode.');
      return;
    }

    // Step 3: Success
    setMessage('Business details submitted successfully!');
    setTimeout(() => {
      navigate('/gst-details'); // Redirect to GST details page
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Business Details
        </h1>
        <p className="text-center text-gray-500 mb-4">
          Please provide some basic information about your business.
        </p>

        {/* Error & Success messages */}
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
                  pickupPincode: e.target.value.replace(/\D/g, '')
                })
              }
              placeholder="Enter 6-digit pickup pincode"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

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

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
          >
            Submit Details
          </button>
        </form>
      </div>
    </div>
  );
}
