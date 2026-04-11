import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

const OTP_LENGTH = 6;

// ── OTP Box Component ─────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[idx]) {
        newDigits[idx] = '';
        onChange(newDigits.join(''));
      } else if (idx > 0) {
        newDigits[idx - 1] = '';
        onChange(newDigits.join(''));
        inputs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = val;
    onChange(newDigits.join(''));
    if (val && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH));
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
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
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-150 shadow-sm
            ${digit ? 'border-brand bg-orange-50 text-amber-900' : 'border-gray-300 bg-white text-gray-800'}
            focus:border-brand focus:ring-2 focus:ring-amber-200 focus:bg-orange-50`}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PhoneNumberVerification() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [resendCd, setResendCd] = useState(0);
  const confirmationResultRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setInterval(() => setResendCd((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCd]);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const showMsg = (text, type = 'info') => { setMessage(text); setMsgType(type); };

  // Setup invisible reCAPTCHA (required by Firebase Phone Auth)
  const setupRecaptcha = () => {
    // Always clear stale verifier first — the container may have been re-rendered
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        window.recaptchaVerifier = null;
      },
    });
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (phone.length !== 10) {
      showMsg('Please enter a valid 10-digit phone number.', 'error');
      return;
    }
    setLoading(true);
    showMsg('');
    try {
      setupRecaptcha();
      const phoneNumber = `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      confirmationResultRef.current = result;
      setOtpSent(true);
      setResendCd(30);
      showMsg('OTP sent successfully!', 'success');
    } catch (err) {
      console.error(err);
      // Reset recaptcha on error so it can be retried
      window.recaptchaVerifier = null;
      showMsg(err.message || 'Failed to send OTP. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      showMsg(`Please enter all ${OTP_LENGTH} digits.`, 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResultRef.current.confirm(otp);
      // Get Firebase ID token to send to backend
      const idToken = await result.user.getIdToken();

      // Tell backend the phone is verified
      const res = await fetch('/api/v1/auth/verify-firebase-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: `+91${phone}`, idToken }),
      });
      const data = await res.json();

      if (data.success || res.ok) {
        localStorage.setItem('verifiedPhone', phone);
        showMsg('Phone verified successfully!', 'success');
        setTimeout(() => navigate('/create-account'), 1000);
      } else {
        showMsg(data.error || 'Verification failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showMsg('Invalid OTP. Please try again.', 'error');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCd > 0) return;
    setOtp('');
    showMsg('');
    window.recaptchaVerifier = null; // reset so a fresh one is created
    await handleSendOtp();
  };

  const msgStyles = {
    info: 'text-blue-700 bg-blue-50 border-blue-300',
    success: 'text-green-700 bg-green-50 border-green-300',
    error: 'text-red-700 bg-red-50 border-red-300',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Invisible reCAPTCHA container — required by Firebase */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-brand">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/logo2.jpeg" alt="ZPIN Logo" className="h-16 w-auto" />
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Account', 'Business', 'GST', 'Bank'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 ? 'bg-brand text-white ring-2 ring-amber-300' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${i === 0 ? 'text-brand' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
              {i < 4 && <div className="h-0.5 w-6 mb-3 rounded bg-gray-200" />}
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

        {/* STEP 1 — Phone input */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 select-none">
                  +91
                </span>
                <input
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
              className="w-full py-3 bg-brand text-white font-semibold rounded-lg shadow-md hover:bg-brand transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button type="button" onClick={() => navigate('/signup')}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
              ← Back
            </button>
          </form>

        ) : (

          /* STEP 2 — OTP input */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter the 6-digit code
              </label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <div className="flex gap-1.5 justify-center">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-200
                  ${i < otp.length ? 'w-6 bg-brand' : 'w-1.5 bg-gray-200'}`} />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < OTP_LENGTH}
              className="w-full py-3 bg-brand text-white font-semibold rounded-lg shadow-md hover:bg-brand transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <button type="button" onClick={() => { setOtpSent(false); setOtp(''); showMsg(''); }}
                className="hover:text-brand underline underline-offset-2 transition">
                Change number
              </button>
              {resendCd > 0 ? (
                <span>Resend in <span className="font-semibold text-brand">{resendCd}s</span></span>
              ) : (
                <button type="button" onClick={handleResendOtp}
                  className="hover:text-brand font-medium underline underline-offset-2 transition">
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
