// src/pages/PhoneNumberVerification.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Phone Number Verification Component
export default function PhoneNumberVerification() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  // Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setOtpSent(true);
    setMessage('OTP sent successfully!');
  };

  // Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }

    // Simulate OTP validation success
    if (otp === '1234' || otp.length === 4) {
      setMessage('Phone number verified successfully!');
      setTimeout(() => {
        navigate('/create-account'); // Redirect to Create Account page
      }, 1200);
    } else {
      setMessage('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Verify Your Phone Number
        </h1>

        {message && (
          <div className="mb-4 text-center text-sm text-blue-700 bg-blue-100 border border-blue-400 rounded py-2">
            {message}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Mobile Number
              </label>
              <input
                id="phone"
                type="text"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
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
