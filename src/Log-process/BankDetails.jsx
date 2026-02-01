// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

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
      // Simulate bank details submission due to CORS issues
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('Bank details submitted successfully! (Demo mode)');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Bank details error:', error);
      setError('Failed to save bank details. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Main container for bank details form */}
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Bank Account Details
        </h1>
        
        {/* Subtitle with instructions */}
        <p className="text-center text-sm text-gray-500 mb-6">
          Please provide your verified bank details for payments and settlements.
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
            {isLoading ? 'Submitting...' : 'Submit Bank Details'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
