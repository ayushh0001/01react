import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';

export default function VerifyResetOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();

  const mobile = location.state?.mobile;
  const devOtp = location.state?.otp; // Only in development mode

  useEffect(() => {
    if (!mobile) {
      navigate('/forgot-password');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mobile, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/password-reset/verify-otp', {
        mobile,
        otp
      });

      if (response.data.success) {
        setMessage('OTP verified successfully!');
        
        // Navigate to reset password page
        setTimeout(() => {
          navigate('/reset-password', {
            state: {
              mobile,
              resetToken: response.data.resetToken
            }
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setResending(true);

    try {
      const response = await API.post('/password-reset/resend-otp', { mobile });
      
      if (response.data.success) {
        setMessage('OTP resent successfully!');
        setTimeLeft(600); // Reset timer
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/forgot-password')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to <span className="font-semibold">{mobile}</span>
            </p>
            
            {/* Development mode - show OTP */}
            {devOtp && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">Dev Mode:</span> OTP is <span className="font-mono font-bold">{devOtp}</span>
                </p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="mb-6 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft > 60 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || timeLeft === 0}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                loading || timeLeft === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying...
                </span>
              ) : timeLeft === 0 ? (
                'OTP Expired'
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={resending || timeLeft > 540} // Can resend after 1 minute
              className={`text-sm font-semibold ${
                resending || timeLeft > 540
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-amber-600 hover:text-amber-700'
              }`}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
