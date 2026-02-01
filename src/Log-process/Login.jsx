// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
// Main Login component
export default function Login() {
  // State management for form inputs and UI states
  const [name, setName] = useState('');                    // Username/email input
  const [password, setPassword] = useState('');            // Password input
  const [alertMessage, setAlertMessage] = useState(null);  // Alert message text
  const [alertType, setAlertType] = useState('info');      // Alert type (success/error/info)
  const [isLoading, setIsLoading] = useState(false);       // Loading state for login button
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Handle form submission and login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!name || !password) {
      setAlertMessage('Both Username/Email and Password fields must be filled!');
      setAlertType('error');
      return;
    }

    setIsLoading(true);

    // Demo mode - accept any credentials
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('authToken', 'demo-token-123');
    setAlertMessage('Login successful! Redirecting to dashboard...');
    setAlertType('success');
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
    
    setIsLoading(false);
  };

  // Handle forgot password functionality
  const handleForgotPassword = async () => {
    if (!name) {
      setAlertMessage('Please enter your email or mobile number first.');
      setAlertType('error');
      return;
    }

    // Demo mode - simulate OTP sent
    setAlertMessage('Password reset OTP sent successfully! (Demo mode)');
    setAlertType('success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 bg-[url('https://placehold.co/1920x1080/f5f5f5/000000?text=Background+Image')] bg-cover">
      
      {/* Alert notification overlay */}
      <AlertBox 
        message={alertMessage} 
        type={alertType} 
        onClose={() => setAlertMessage(null)} 
      />
      
      {/* Main login container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Logo section */}
          <div className="flex justify-center mb-6">
            <ZipinLogo className="h-10 w-auto" />
          </div>
          
          {/* Welcome heading */}
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Welcome Back!
          </h1>
          
          {/* Login form */}
          <form onSubmit={handleLogin} className="flex flex-col items-center space-y-4">
            
            {/* Username/Email field */}
            <label htmlFor="name" className="self-start text-sm font-medium text-gray-700">
              Username / Email
            </label>
            <input
              type="text"
              id="name"
              placeholder="Email or username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150"
              required
            />
            
            {/* Password field */}
            <label htmlFor="password" className="self-start text-sm font-medium text-gray-700 mt-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150"
              required
            />
            
            {/* Forgot password link */}
            <div className="w-full text-right text-sm -mt-2">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-gray-600 hover:text-amber-600 transition duration-150 underline"
              >
                Forgot password?
              </button>
            </div>
            
            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 mt-8 text-white font-semibold rounded-xl transition duration-300 shadow-md ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            
          </form>
          
          {/* Sign up link */}
          <div className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="text-amber-600 font-semibold hover:underline"
            >
              Sign up Zpin
            </button>
          </div>
          
        </div>
        
        {/* Right side - Illustration (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-amber-500/10 items-center justify-center p-8">
          <img
            src="https://placehold.co/500x500/fccf03/242424?text=Login+Illustration"
            alt="Login Illustration"
            className="w-full h-auto object-contain rounded-lg shadow-lg"
          />
        </div>
        
      </div>
    </div>
  );
}
