import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api'; // withCredentials:true — sends auth cookie via Vite proxy

export default function Details() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    pickupPincode: '',
    businessDescription: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { displayName, pickupPincode, businessDescription } = formData;

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
      // POST /api/v1/users/seller/business-details
      // API instance sends the auth cookie automatically (withCredentials:true via Vite proxy)
      await API.post('/users/seller/business-details', {
        businessName: displayName,
        businessDescription: businessDescription,
        businessType: 'general',
        gstNo: '',
        panNo: '',
        address: '',
        city: '',
        state: '',
        pincode: pickupPincode,
      });

      setMessage('Business details saved! Proceeding...');
      setTimeout(() => navigate('/gst-details'), 1500);

    } catch (err) {
      const status = err?.response?.status;
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save details. Please try again.';
      const msg = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);

      if (status === 403 || status === 401) {
        setError('Access denied. Please log in and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-brand">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/logo2.jpeg" alt="ZPIN Logo" className="h-16 w-auto" />
        </div>

        {/* Step progress bar — step 3 active */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Account', 'Business', 'GST', 'Bank'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 2
                    ? 'bg-brand text-white ring-2 ring-amber-300'
                    : i < 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {i < 2 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${i === 2 ? 'text-brand' : i < 2 ? 'text-green-600' : 'text-gray-400'
                  }`}>{step}</span>
              </div>
              {i < 4 && (
                <div className={`h-0.5 w-6 mb-3 rounded ${i < 2 ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1 text-brand">
          Business Details
        </h1>
        <p className="text-center text-gray-500 text-sm mb-5">
          Step 3 of 5 — Tell us about your business
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-300 rounded-lg py-3 px-3 space-y-2 text-center">
            <p>{error}</p>
            {(error.includes('denied') || error.includes('log in')) && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-1 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Go to Login →
              </button>
            )}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="mb-4 text-center text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg py-2 px-3">
            ✅ {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName" name="displayName" type="text"
              value={formData.displayName} onChange={handleChange}
              placeholder="Enter your store / business name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-brand outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="pickupPincode" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Pincode
            </label>
            <input
              id="pickupPincode" name="pickupPincode" type="text"
              inputMode="numeric" maxLength={6}
              value={formData.pickupPincode}
              onChange={(e) =>
                setFormData({ ...formData, pickupPincode: e.target.value.replace(/\D/g, '') })
              }
              placeholder="6-digit pincode"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-brand outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Business Description
            </label>
            <textarea
              id="businessDescription" name="businessDescription"
              value={formData.businessDescription} onChange={handleChange}
              rows={4}
              placeholder="What do you sell? Describe your products or services..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-brand outline-none resize-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-brand hover:bg-brand text-white'
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
            onClick={() => navigate('/create-account')}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
          >
            ← Back
          </button>

        </form>

      </div>
    </div>
  );
}
