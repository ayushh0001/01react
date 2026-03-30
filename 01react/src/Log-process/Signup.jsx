// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

// Logo component - displays the ZPIN logo image
const ZipinLogo = ({ className = "h-16 w-auto", onImageError }) => {
  return (
    <img
      src="/logo2.jpeg"
      alt="ZPIN Logo"
      className={className}
      onError={onImageError}
    />
  );
};

// Google Logo SVG Component
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Alert notification component - shows success/error/info messages
const AlertBox = ({ message, type = 'info', onClose }) => {
  // Don't render anything if no message is provided
  if (!message) {
    return null;
  }

  // Define color schemes for different alert types
  const getAlertStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100 border-green-400',
          textColor: 'text-green-700'
        };
      case 'error':
        return {
          bgColor: 'bg-red-100 border-red-400',
          textColor: 'text-red-700'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100 border-blue-400',
          textColor: 'text-blue-700'
        };
    }
  };

  const { bgColor, textColor } = getAlertStyles(type);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
      <div className={`${bgColor} ${textColor} p-4 rounded-lg border shadow-lg max-w-sm w-full flex items-center justify-between`}>
        <p className="text-sm font-medium">
          {message}
        </p>

        {/* Close button with X symbol */}
        <button
          onClick={onClose}
          className={`ml-4 ${textColor} hover:opacity-75 font-bold`}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// Main Signup component - handles initial user registration
export default function Signup() {
  // State management for form and UI states
  const [username, setUsername] = useState('');
  const [logoVisible, setLogoVisible] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  // Hook for programmatic navigation
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!username) {
      setAlertMessage('Username or Email is required for signup.');
      setAlertType('error');
      return;
    }

    const isEmail = username.includes('@');
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
        setAlertMessage('Please enter a valid email address.');
        setAlertType('error');
        return;
      }
    }

    setIsLoading(true);
    
    // Save username/email to localStorage for next step
    localStorage.setItem('signupUsername', username);

    setAlertMessage('Username/Email saved! Proceeding to phone verification...');
    setAlertType('success');

    setTimeout(() => {
      setAlertMessage(null);
      navigate('/phone');
    }, 1500);
  };

  // Handle Google OAuth signup
  const handleGoogleSignup = () => {
    const backendUrl = import.meta.env.PROD 
      ? 'https://zpin-backend.onrender.com'
      : 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 bg-[url('https://placehold.co/1920x1080/f5f5f5/000000?text=Background+Image')] bg-cover">

      {/* Alert notification overlay */}
      <AlertBox
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      {/* Main signup container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-brand flex flex-col md:flex-row overflow-hidden min-h-[600px]">

        {/* Left side - Signup form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">

          {/* Logo section */}
          <div className="flex justify-center mb-6">
            {logoVisible && (
              <ZipinLogo className="h-20 w-auto" onImageError={() => setLogoVisible(false)} />
            )}
          </div>

          {/* Welcome heading */}
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Sign up to ZPIN
          </h1>

          {/* Signup form */}
          <form onSubmit={handleSignup} className="flex flex-col items-center space-y-4">

            {/* Username/Email field */}
            <label htmlFor="username" className="self-start text-sm font-medium text-gray-700">
              Username / Email
            </label>
            <input
              type="text"
              id="username"
              placeholder="Email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-brand transition duration-150"
              required
            />

            {/* Signup button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full max-w-sm p-3 mt-8 text-white font-semibold rounded-xl transition duration-300 shadow-md ${isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
                }`}
            >
              {isLoading ? 'Processing...' : 'Next'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full p-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition duration-300 flex items-center justify-center gap-3 shadow-sm"
          >
            <GoogleLogo />
            Sign up with Google
          </button>

          {/* Login link for existing users */}
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-brand font-semibold hover:underline"
            >
              Log in Zpin
            </button>
          </div>

          {/* Privacy policy notice */}
          <p className="text-center text-xs text-gray-400 mt-6">
            This site is protected by reCAPTCHA and the Google Privacy Policy and Term of Service apply.
          </p>

        </div>

        {/* Right side - Illustration (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-brand/10 items-center justify-center p-8">
          <img
            src="./sign-up-form.png"
            alt="Signup Illustration"
            className="w-full h-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden flex-col items-center justify-center text-brand">
            <svg className="w-32 h-32 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 0v12h12V4H4z" clipRule="evenodd" />
              <path d="M6 8a2 2 0 114 0 2 2 0 01-4 0zM8 12a3 3 0 00-3 3h6a3 3 0 00-3-3z" />
            </svg>
            <p className="text-lg font-semibold">Welcome to ZPIN</p>
          </div>
        </div>

      </div>
    </div>
  );
}
