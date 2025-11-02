import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    // Step 3: Validate IFSC code (4 letters + 0 + 6 digits)
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifscCode.toUpperCase())) {
      setError('Please enter a valid IFSC code.');
      return;
    }

    // Step 4: Validation passed
    setMessage('Bank details submitted successfully!');
    setTimeout(() => {
      navigate('/'); // Redirect to home or dashboard page
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Bank Account Details
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Please provide your verified bank details for payments and settlements.
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
                  accountNumber: e.target.value.replace(/\D/g, '')
                })
              }
              placeholder="Enter account number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

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
                  confirmAccountNumber: e.target.value.replace(/\D/g, '')
                })
              }
              placeholder="Re-enter account number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

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
                  ifscCode: e.target.value.toUpperCase()
                })
              }
              placeholder="e.g., HDFC0001234"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

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
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
          >
            Submit Bank Details
          </button>
        </form>
      </div>
    </div>
  );
}
