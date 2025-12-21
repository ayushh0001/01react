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
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
    />
  </div>
);

/* Reusable SelectField Component */
const SelectField = ({ label, name, value, options, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
    >
      <option value="">Select type</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

/* FormWrapper Component for consistent styling and layout */
const FormWrapper = ({ title, children, error, message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">{title}</h1>

      {/* Display error or success messages */}
      {error && <div className="mb-4 text-center text-sm text-red-700 bg-red-100 border border-red-400 rounded py-2">{error}</div>}
      {message && <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-400 rounded py-2">{message}</div>}

      {children}
    </div>
  </div>
);

export default function GSTDetails() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    gstNumber: '',
    businessType: '',
    registeredName: '',
    panNumber: ''
  });

  // Error & success messages state
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

    const { gstNumber, businessType, registeredName, panNumber } = formData;

    // Step 1: All fields required
    if (!gstNumber || !businessType || !registeredName || !panNumber) {
      setError('All fields are required.');
      return;
    }

    // Step 2: Validate GSTIN format (15 alphanumeric characters)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber.toUpperCase())) {
      setError('Please enter a valid GST number.');
      return;
    }

    // Step 3: Validate PAN format (10 alphanumeric characters)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      setError('Please enter a valid PAN number.');
      return;
    }

    // Step 4: Success
    setMessage('GST details submitted successfully!');
    setTimeout(() => navigate('/bank'), 1500); // Redirect to BankDetails page
  };

  // Business type options
  const businessOptions = [
    { value: 'proprietorship', label: 'Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'pvt-ltd', label: 'Private Limited' },
    { value: 'llp', label: 'LLP' },
    { value: 'ngo', label: 'NGO' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <FormWrapper title="GST & Tax Information" error={error} message={message}>
      <p className="text-center text-gray-500 mb-4">
        Please enter your GST details carefully. These details are required for invoice generation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="GST Number"
          name="gstNumber"
          value={formData.gstNumber}
          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
          placeholder="Enter 15-character GSTIN"
          maxLength={15}
        />

        <SelectField
          label="Business Type"
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          options={businessOptions}
        />

        <InputField
          label="Registered Business Name"
          name="registeredName"
          value={formData.registeredName}
          onChange={handleChange}
          placeholder="Legal name as per GST registration"
        />

        <InputField
          label="PAN Number"
          name="panNumber"
          value={formData.panNumber}
          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
          placeholder="ABCDE1234F"
          maxLength={10}
        />

        <button
          type="submit"
          className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
        >
          Submit GST Info
        </button>
      </form>
    </FormWrapper>
  );
}
