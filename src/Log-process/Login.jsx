// =====================
// React & Router Imports
// =====================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// =====================
// Logo Component
// Single Responsibility: Only renders logo
// =====================
const ZipinLogo = ({ className = "h-8 w-auto" }) => (
  <div
    className={`flex items-center justify-center font-['Bungee',cursive] text-2xl font-bold text-amber-500 ${className}`}
  >
    ZPIN
  </div>
);


// =====================
// AlertBox Component
// Reusable alert for success / error / info
// =====================
const AlertBox = ({ message, type = 'info', onClose }) => {

  // If no message, render nothing
  if (!message) return null;

  // Alert color configuration
  let bgColor, textColor;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-100 border-green-400';
      textColor = 'text-green-700';
      break;

    case 'error':
      bgColor = 'bg-red-100 border-red-400';
      textColor = 'text-red-700';
      break;

    case 'info':
    default:
      bgColor = 'bg-blue-100 border-blue-400';
      textColor = 'text-blue-700';
      break;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
      <div
        className={`${bgColor} ${textColor} p-4 rounded-lg border shadow-lg max-w-sm w-full flex items-center justify-between`}
      >
        <p className="text-sm font-medium">{message}</p>

        {/* Close Alert Button */}
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


// =====================
// Login Page Component
// =====================
export default function Login() {

  // ---------------------
  // State Management
  // ---------------------
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');

  const [isLoading, setIsLoading] = useState(false);

  // Navigation Hook
  const navigate = useNavigate();


  // ---------------------
  // Login Handler
  // ---------------------
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    setAlertMessage(null);

    // Basic validation
    if (!name || !password) {
      setAlertMessage('Both Username/Email and Password fields must be filled!');
      setAlertType('error');
      return;
    }

    setIsLoading(true);

    try {
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success case
      setAlertMessage('Login successful! Redirecting to home...');
      setAlertType('success');

      setTimeout(() => {
        setAlertMessage(null);
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      // Error case
      setAlertMessage('Login failed. Please check your credentials.');
      setAlertType('error');
      setIsLoading(false);

    } finally {
      // Stop loader if not successful
      if (alertType !== 'success') {
        setIsLoading(false);
      }
    }
  };


  // =====================
  // UI Rendering
  // =====================
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 bg-[url('https://placehold.co/1920x1080/f5f5f5/000000?text=Background+Image')] bg-cover">

      {/* Alert Message */}
      <AlertBox
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col md:flex-row overflow-hidden min-h-[600px]">

        {/* Left Section - Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">

          <div className="flex justify-center mb-6">
            <ZipinLogo className="h-10 w-auto" />
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Welcome Back!
          </h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col items-center space-y-4">

            <label className="self-start text-sm font-medium text-gray-700">
              Username / Email
            </label>

            <input
              type="text"
              placeholder="Email or username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />

            <label className="self-start text-sm font-medium text-gray-700 mt-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />

            <div className="w-full text-right text-sm -mt-2">
              <a href="#" className="text-gray-600 hover:text-amber-600">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 mt-8 text-white font-semibold rounded-xl transition duration-300
                ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

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

        {/* Right Section - Illustration */}
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
