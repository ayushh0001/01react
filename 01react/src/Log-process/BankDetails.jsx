import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

// Main BankDetails component - handles bank account information collection
export default function BankDetails() {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State for all form fields - stores bank account information
  const [formData, setFormData] = useState({
    accountHolderName: '',      // Name as per bank account
    accountNumber: '',          // Bank account number
    confirmAccountNumber: '',   // Confirmation of account number
    ifscCode: '',              // Bank IFSC code
    bankName: '',              // Name of the bank
    branchName: ''             // Branch name/location
  });

  // State for error and success messages
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

    const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName, branchName } = formData;

    // Validation
    if (!accountHolderName || !accountNumber || !confirmAccountNumber || !ifscCode || !bankName || !branchName) {
      setError('Please fill in all fields.');
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match.');
      return;
    }

    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifscCode.toUpperCase())) {
      setError('Please enter a valid IFSC code.');
      return;
    }

    setIsLoading(true);

    try {
      // Save bank details
      await API.post('/users/seller/bank-details', {
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName,
        branchName,
        accountType: 'savings'
      });

      setMessage('Bank details saved! Taking you to the dashboard...');
      setTimeout(() => navigate('/dashboard'), 1200);

    } catch (err) {
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save bank details. Please try again.';
      setError(typeof raw === 'object' ? JSON.stringify(raw) : String(raw));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-brand">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/logo2.jpeg" alt="ZPIN Logo" className="h-16 w-auto" />
        </div>

        {/* Step progress bar — step 5 active */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Account', 'Business', 'GST', 'Bank'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 4
                    ? 'bg-brand text-white ring-2 ring-amber-300'
                    : i < 4
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                  {i < 4 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${i === 4 ? 'text-brand' : i < 4 ? 'text-green-600' : 'text-gray-400'
                  }`}>{step}</span>
              </div>
              {i < 4 && (
                <div className={`h-0.5 w-6 mb-3 rounded ${i < 4 ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1 text-brand">
          Bank Account Details
        </h1>
        <p className="text-center text-gray-500 text-sm mb-5">
          Step 5 of 5 — Last step! Add your bank details for payments
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

        {/* Bank details form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Account holder name field */}
          <div>
            <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name
            </label>
            <input
              id="accountHolderName"
              name="accountHolderName"
              type="text"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Enter account holder's name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Account number field - only allows digits */}
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              value={formData.accountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accountNumber: e.target.value.replace(/\D/g, '')  // Remove non-digits
                })
              }
              placeholder="Enter account number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Confirm account number field - only allows digits */}
          <div>
            <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Account Number
            </label>
            <input
              id="confirmAccountNumber"
              name="confirmAccountNumber"
              type="text"
              value={formData.confirmAccountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmAccountNumber: e.target.value.replace(/\D/g, '')  // Remove non-digits
                })
              }
              placeholder="Re-enter account number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* IFSC code field - converts to uppercase automatically */}
          <div>
            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            <input
              id="ifscCode"
              name="ifscCode"
              type="text"
              maxLength={11}
              value={formData.ifscCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ifscCode: e.target.value.toUpperCase()  // Convert to uppercase
                })
              }
              placeholder="e.g., HDFC0001234"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Bank name field */}
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              id="bankName"
              name="bankName"
              type="text"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g., HDFC Bank"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Branch name field */}
          <div>
            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              id="branchName"
              name="branchName"
              type="text"
              value={formData.branchName}
              onChange={handleChange}
              placeholder="e.g., Andheri West Branch"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-brand hover:bg-brand text-white'
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
            ) : 'Complete Setup →'}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/gst-details')}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
          >
            ← Back
          </button>

        </form>

      </div>
    </div>
  );
}
