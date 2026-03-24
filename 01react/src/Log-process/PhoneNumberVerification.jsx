// Import necessary React hooks and router functionality
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// All requests via Vite proxy — avoids CORS, sends cookies automatically
const API_BASE_URL = '/api/v1';
const OTP_LENGTH = 6;

// ── OTP Box Component ─────────────────────────────────────────────────────────
// Renders 6 individual digit boxes; handles auto-focus, paste, and backspace
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);

  // Split the string value into an array of 6 characters
  const digits = value.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[idx]) {
        // Clear current box
        newDigits[idx] = '';
        onChange(newDigits.join(''));
      } else if (idx > 0) {
        // Move to previous box and clear it
        newDigits[idx - 1] = '';
        onChange(newDigits.join(''));
        inputs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1); // only last digit
    const newDigits = [...digits];
    newDigits[idx] = val;
    onChange(newDigits.join(''));
    if (val && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH));
    // Focus last filled box
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all duration-150 shadow-sm
            ${digit
              ? 'border-amber-500 bg-amber-50 text-amber-900'
              : 'border-gray-300 bg-white text-gray-800'}
            focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:bg-amber-50
          `}
        />
      ))}
    </div>
  );
}

// ── Main PhoneNumberVerification Component ────────────────────────────────────
export default function PhoneNumberVerification() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');        // 6-char string e.g. "123456"
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('info');    // 'info' | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [resendCd, setResendCd] = useState(0);         // resend countdown in seconds

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setInterval(() => setResendCd((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCd]);

  const showMsg = (text, type = 'info') => {
    setMessage(text);
    setMsgType(type);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      showMsg('Please enter a valid 10-digit phone number.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/verification/sendOTP`,
        { mobile: phone },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      setOtpSent(true);
      setResendCd(30); // 30-second resend cooldown
      showMsg(response.data.message || 'OTP sent successfully!', 'success');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to send OTP.';
      showMsg(typeof msg === 'object' ? JSON.stringify(msg) : String(msg), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCd > 0) return;
    setOtp('');
    showMsg('');
    await handleSendOtp({ preventDefault: () => { } });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\s/g, '').length < OTP_LENGTH) {
      showMsg(`Please enter all ${OTP_LENGTH} digits.`, 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/verification/verifyOTP`,
        { mobile: phone, otp },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      showMsg(response.data.message || 'Phone verified successfully!', 'success');
      localStorage.setItem('verifiedPhone', phone);
      setTimeout(() => navigate('/create-account'), 1200);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid OTP. Please try again.';
      showMsg(typeof msg === 'object' ? JSON.stringify(msg) : String(msg), 'error');
      setOtp(''); // clear boxes on wrong OTP
    } finally {
      setLoading(false);
    }
  };

  // Message banner colour
  const msgStyles = {
    info: 'text-blue-700 bg-blue-50 border-blue-300',
    success: 'text-green-700 bg-green-50 border-green-300',
    error: 'text-red-700 bg-red-50 border-red-300',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/logo2.jpeg" alt="ZPIN Logo" className="h-16 w-auto" />
        </div>

        {/* Step progress bar — step 1 active */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Account', 'Business', 'GST', 'Bank'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${i === 0 ? 'text-amber-600' : 'text-gray-400'
                  }`}>{step}</span>
              </div>
              {i < 4 && (
                <div className="h-0.5 w-6 mb-3 rounded bg-gray-200" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1 text-gray-900">
          {otpSent ? 'Enter Verification Code' : 'Verify Your Phone Number'}
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          {otpSent
            ? `We sent a 6-digit code to +91 ${phone}`
            : 'Enter your mobile number to receive an OTP'}
        </p>

        {/* Message banner */}
        {message && (
          <div className={`mb-5 text-center text-sm border rounded-lg py-2 px-3 ${msgStyles[msgType]}`}>
            {message}
          </div>
        )}

        {/* ── STEP 1: Phone number ── */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 select-none">
                  +91
                </span>
                <input
                  id="phone"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="flex-1 px-4 py-3 outline-none text-gray-800 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md
                         hover:bg-amber-600 transition duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
            >
              ← Back
            </button>
          </form>

        ) : (

          /* ── STEP 2: OTP boxes ── */
          <form onSubmit={handleVerifyOtp} className="space-y-6">

            {/* 6 OTP boxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter the 6-digit code
              </label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i < otp.length ? 'w-6 bg-amber-500' : 'w-1.5 bg-gray-200'
                    }`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading || otp.length < OTP_LENGTH}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md
                         hover:bg-amber-600 transition duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend + change number */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); showMsg(''); }}
                className="hover:text-amber-600 underline underline-offset-2 transition"
              >
                Change number
              </button>

              {resendCd > 0 ? (
                <span>Resend in <span className="font-semibold text-amber-600">{resendCd}s</span></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="hover:text-amber-600 font-medium underline underline-offset-2 transition"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
