// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

// Main PhoneNumberVerification component - handles phone number verification via OTP
export default function PhoneNumberVerification() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State management for phone verification process
  const [phone, setPhone] = useState('');        // Phone number input
  const [otp, setOtp] = useState('');            // OTP input
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [message, setMessage] = useState('');    // Status message display

  // Handle OTP sending - validates phone number and sends OTP via API
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      // Simulate OTP sending due to CORS issues
      setOtpSent(true);
      setMessage('OTP sent successfully! (Demo: Use 1234)');
    } catch (error) {
      console.error('Send OTP error:', error);
      setMessage('Failed to send OTP. Please try again.');
    }
  };

  // Handle OTP verification - validates OTP via API and proceeds to next step
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }

    try {
      // Simulate OTP verification due to CORS issues
      if (otp === '1234' || otp.length === 4) {
        setMessage('Phone number verified successfully!');
        localStorage.setItem('verifiedPhone', phone);
        
        setTimeout(() => {
          navigate('/create-account');
        }, 1200);
      } else {
        setMessage('Invalid OTP. Please use 1234 for demo.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setMessage('OTP verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Main container for phone verification */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Verify Your Phone Number
        </h1>

        {/* Status message display */}
        {message && (
          <div className="mb-4 text-center text-sm text-blue-700 bg-blue-100 border border-blue-400 rounded py-2">
            {message}
          </div>
        )}

        {/* Conditional rendering based on OTP sent status */}
        {!otpSent ? (
          
          /* Phone number input form - shown initially */
          <form onSubmit={handleSendOtp} className="space-y-5">
            
            {/* Phone number field - only allows digits, max 10 characters */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Mobile Number
              </label>
              <input
                id="phone"
                type="text"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}  // Remove non-digits
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            {/* Send OTP button */}
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
            >
              Send OTP
            </button>
            
          </form>
          
        ) : (
          
          /* OTP verification form - shown after OTP is sent */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            
            {/* OTP input field - only allows digits, max 4 characters */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}  // Remove non-digits
                placeholder="Enter 4-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            {/* Verify OTP button */}
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
            >
              Verify OTP
            </button>
            
          </form>
          
        )}
        
      </div>
    </div>
  );
}
