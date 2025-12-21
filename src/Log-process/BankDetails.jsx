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

/* FormWrapper Component */
const FormWrapper = ({ title, children, error, message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">{title}</h1>
      {error && <div className="mb-4 text-center text-sm text-red-700 bg-red-100 border border-red-400 rounded py-2">{error}</div>}
      {message && <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-400 rounded py-2">{message}</div>}
      {children}
    </div>
  </div>
);

export default function BankDetails() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName, branchName } = formData;

    // Step 1: Check empty fields
    if (!accountHolderName || !accountNumber || !confirmAccountNumber || !ifscCode || !bankName || !branchName) {
      setError('Please fill in all fields.');
      return;
    }

    // Step 2: Match account numbers
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match.');
      return;
    }

    // Step 3: Validate IFSC code
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifscCode.toUpperCase())) {
      setError('Please enter a valid IFSC code.');
      return;
    }

    // Step 4: All validations passed
    setMessage('Bank details submitted successfully!');

    // Redirect after 1.5s
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <FormWrapper title="Bank Account Details" error={error} message={message}>
      <p className="text-center text-sm text-gray-500 mb-6">
        Please provide your verified bank details for payments and settlements.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Enter account holder's name" />
        <InputField
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
          placeholder="Enter account number"
        />
        <InputField
          label="Confirm Account Number"
          name="confirmAccountNumber"
          value={formData.confirmAccountNumber}
          onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
          placeholder="Re-enter account number"
        />
        <InputField
          label="IFSC Code"
          name="ifscCode"
          value={formData.ifscCode}
          maxLength={11}
          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
          placeholder="e.g., HDFC0001234"
        />
        <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g., HDFC Bank" />
        <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="e.g., Andheri West Branch" />

        <button type="submit" className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300">
          Submit Bank Details
        </button>
      </form>
    </FormWrapper>
  );
}
