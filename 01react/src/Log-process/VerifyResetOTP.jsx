import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyResetOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile;

  useEffect(() => {
    if (!mobile || !window._firebaseConfirmationResult) {
      navigate('/forgot-password');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [mobile, navigate]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) { setError('Please enter a valid 6-digit OTP'); return; }

    setLoading(true);
    try {
      const confirmationResult = window._firebaseConfirmationResult;
      const result = await confirmationResult.confirm(otp);
      // Get Firebase ID token to pass to backend for password reset
      const idToken = await result.user.getIdToken();
      window._firebaseConfirmationResult = null;

      setMessage('OTP verified successfully!');
      setTimeout(() => {
        navigate('/reset-password', { state: { mobile, idToken } });
      }, 800);
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    navigate('/forgot-password', { state: { mobile } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <button onClick={() => navigate('/forgot-password')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 p-8">
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
          </div>

          <div className="mb-6 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft > 60 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <button type="submit" disabled={loading || timeLeft === 0}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                loading || timeLeft === 0 ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 shadow-lg'
              }`}>
              {loading ? 'Verifying...' : timeLeft === 0 ? 'OTP Expired' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button onClick={handleResend}
              className="text-sm font-semibold text-brand hover:text-amber-700">
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
