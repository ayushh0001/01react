import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Reusable InputField Component */
const InputField = ({ label, name, type = 'text', value, placeholder, onChange, maxLength }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      maxLength={maxLength}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
    />
  </div>
);

/* Reusable TextArea Component */
const TextAreaField = ({ label, name, value, placeholder, rows = 4, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
    />
  </div>
);

/* FormWrapper Component for consistent styling */
const FormWrapper = ({ title, children, error, message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">{title}</h1>

      {/* Display error or success messages */}
      {error && <div className="mb-4 text-center text-sm text-red-700 bg-red-100 border border-red-400 rounded py-2">{error}</div>}
      {message && <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-400 rounded py-2">{message}</div>}

      {children}
    </div>
  </div>
);

export default function Details() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    pickupPincode: '',
    businessDescription: ''
  });

  // Error & Success messages state
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { displayName, pickupPincode, businessDescription } = formData;

    // Step 1: Check all fields filled
    if (!displayName || !pickupPincode || !businessDescription) {
      setError('Please fill in all fields.');
      return;
    }

    // Step 2: Validate 6-digit numeric pincode
    if (!/^\d{6}$/.test(pickupPincode)) {
      setError('Please enter a valid 6-digit pickup pincode.');
      return;
    }

    // Step 3: Validation successful
    setMessage('Business details submitted successfully!');

    // Redirect after 1.5 seconds
    setTimeout(() => navigate('/gst-details'), 1500);
  };

  return (
    <FormWrapper title="Business Details" error={error} message={message}>
      <p className="text-center text-gray-500 mb-4">
        Please provide some basic information about your business.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input fields */}
        <InputField
          label="Display Name"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Enter your display name"
        />

        <InputField
          label="Pickup Pincode"
          name="pickupPincode"
          value={formData.pickupPincode}
          onChange={(e) =>
            setFormData({ ...formData, pickupPincode: e.target.value.replace(/\D/g, '') })
          }
          placeholder="Enter 6-digit pickup pincode"
          maxLength={6}
        />

        <TextAreaField
          label="Business Description"
          name="businessDescription"
          value={formData.businessDescription}
          onChange={handleChange}
          placeholder="Write a short description about your business (what you sell, services provided, etc.)"
        />

        <button
          type="submit"
          className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
        >
          Submit Details
        </button>
      </form>
    </FormWrapper>
  );
}
