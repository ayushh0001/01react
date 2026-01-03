// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

// Logo component - displays the ZPIN brand name with styling
const ZipinLogo = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`flex items-center justify-center font-['Bungee',cursive] text-2xl font-bold text-amber-500 ${className}`}>
      ZPIN
    </div>
  );
};

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
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Handle form submission and signup logic
  const handleSignup = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!username) {
      setAlertMessage('Username or Email is required for signup.');
      setAlertType('error');
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = username.includes('@');
      
      if (isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
          setAlertMessage('Please enter a valid email address.');
          setAlertType('error');
          setIsLoading(false);
          return;
        }
      }
      
      // Check if username/email exists via API
      try {
        // Skip API call for now due to CORS issues
        // await axios.get(`${API_BASE_URL}/users`, {
        //   params: { search: username }
        // });
      } catch (apiError) {
        // User doesn't exist, which is good for signup
      }
      
      localStorage.setItem('signupUsername', username);
      
      setAlertMessage('Username/Email validated! Proceeding to next step...');
      setAlertType('success');
      
      setTimeout(() => {
        setAlertMessage(null);
        navigate('/phone');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'ERR_NETWORK' || error.message.includes('fetch')) {
        setAlertMessage('Server is not running. Please start the backend server.');
      } else {
        setAlertMessage('Network error. Please try again.');
      }
      setAlertType('error');
      setIsLoading(false);
    }
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
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left side - Signup form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Logo section */}
          <div className="flex justify-center mb-6">
            <ZipinLogo className="h-10 w-auto" />
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150"
              required
            />
            
            {/* Signup button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full max-w-sm p-3 mt-8 text-white font-semibold rounded-xl transition duration-300 shadow-md ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Processing...' : 'Next'}
            </button>
            
          </form>
          
          {/* Login link for existing users */}
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-amber-600 font-semibold hover:underline"
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
        <div className="hidden md:flex md:w-1/2 bg-amber-500/10 items-center justify-center p-8">
          <img
            src="https://placehold.co/500x500/fccf03/242424?text=Signup+Illustration"
            alt="Signup Illustration"
            className="w-full h-auto object-contain rounded-lg shadow-lg"
          />
        </div>
        
      </div>
    </div>
  );
}
