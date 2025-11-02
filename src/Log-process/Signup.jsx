import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ZipinLogo = ({ className = "h-8 w-auto" }) => (
  <div className={`flex items-center justify-center font-['Bungee',cursive] text-2xl font-bold text-amber-500 ${className}`}>
    ZPIN
  </div>
);

const AlertBox = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

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
    <div className={`fixed inset-0 z-50 flex items-start justify-center p-4 pt-16`}>
      <div className={`${bgColor} ${textColor} p-4 rounded-lg border shadow-lg max-w-sm w-full flex items-center justify-between`}>
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className={`ml-4 ${textColor} hover:opacity-75 font-bold`}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default function Signup() {
  const [username, setUsername] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setAlertMessage('Username/Email saved! Proceeding to next step...');
      setAlertType('success');
      setTimeout(() => {
        setAlertMessage(null);
        navigate('/phone');
      }, 2000);
    } catch (error) {
      setAlertMessage('Signup failed. Please try again.');
      setAlertType('error');
      setIsLoading(false);
    } finally {
      if (alertType !== 'success') {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 bg-[url('https://placehold.co/1920x1080/f5f5f5/000000?text=Background+Image')] bg-cover">
      <AlertBox message={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <ZipinLogo className="h-10 w-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Sign up to ZPIN</h1>
          <form onSubmit={handleSignup} className="flex flex-col items-center space-y-4">
            <label htmlFor="username" className="self-start text-sm font-medium text-gray-700">Username / Email</label>
            <input
              type="text"
              id="username"
              placeholder="Email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full max-w-sm p-3 mt-8 text-white font-semibold rounded-xl transition duration-300 shadow-md ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
            >
              {isLoading ? 'Processing...' : 'Next'}
            </button>
          </form>
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-amber-600 font-semibold hover:underline">
              Log in Zpin
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            This site is protected by reCAPTCHA and the Google Privacy Policy and Term of Service apply.
          </p>
        </div>
        <div className="hidden md:flex md:w-1/2 bg-amber-500/10 items-center justify-center p-8">
          <img
            src="https://placehold.co/500x500/fccf03/242424?text=Signup+Illustration"
            alt="Signup Illustration"
            className="w-full h-auto object-contain rounded-lg shadow-lg"
            onError={(e) => (e.target.src = 'https://placehold.co/500x500/fccf03/242424?text=Signup+Illustration')}
          />
        </div>
      </div>
    </div>
  );
}
