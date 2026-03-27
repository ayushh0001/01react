import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api'; // ← use shared instance so response interceptor captures the JWT

// Logo component - displays the ZPIN logo image
const ZipinLogo = ({ className = "h-16 w-auto" }) => {
  return (
    <img
      src="/logo2.jpeg"
      alt="ZPIN Logo"
      className={className}
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
        };      case 'info':
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

  // Handle error params from OAuth redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error === 'account_suspended') {
      setAlertMessage('🚫 Your account has been suspended by the admin. Please contact support at support@zpinshop.com.');
      setAlertType('error');
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error === 'auth_failed') {
      setAlertMessage('Google login failed. Please try again.');
      setAlertType('error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Handle form submission — calls POST /api/v1/auth/login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!name || !password) {
      setAlertMessage('Both Username/Email and Password fields must be filled!');
      setAlertType('error');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Use shared API instance — POST /api/v1/auth/login
      // The response interceptor in api.js will automatically capture & store the JWT
      // API contract body: { email: string, password: string }
      // NOTE: 'email' field accepts both email address OR username
      const response = await API.post('/auth/login', {
        email: name,        // the user's email OR username
        password: password, // the user's password
      });

      // API contract success: { success: true, message: "Logged in successfully" }
      if (response.data.success || response.status === 200) {
        // Explicitly save token if present in response
        const token = response.data.token || response.data.data?.token || response.data.accessToken;
        if (token) {
          localStorage.setItem('authToken', token);
          console.log('✅ Token explicitly saved:', token.substring(0, 20) + '...');
        }
        
        // Save userId if the response includes it
        const uid =
          response.data.user?.id || response.data.user?._id ||
          response.data.data?.id || response.data.data?._id ||
          response.data._id || response.data.id;
        if (uid) {
          localStorage.setItem('userId', String(uid));
          console.log('✅ UserId saved:', uid);
        }

        setAlertMessage(response.data.message || 'Login successful! Redirecting...');
        setAlertType('success');
        setTimeout(() => { navigate('/dashboard'); }, 1500);
      }
    } catch (error) {
      // Extract and show the server error message.
      // IMPORTANT: message/error fields from the server can sometimes be objects,
      // not strings. String() coercion prevents React error #31 (rendering objects).
      const raw =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Login failed. Please check your credentials and try again.';

      const serverMessage = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
      const code = error?.response?.data?.code;

      // Show a prominent suspension alert
      if (code === 'ACCOUNT_SUSPENDED' || error?.response?.status === 403) {
        setAlertMessage('🚫 Your account has been suspended by the admin. Please contact support at support@zpinshop.com.');
        setAlertType('error');
      } else {
        setAlertMessage(serverMessage);
        setAlertType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to the forgot-password flow
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
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

      {/* Main login container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col md:flex-row overflow-hidden min-h-[600px]">

        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">

          {/* Logo section */}
          <div className="flex justify-center mb-6">
            <ZipinLogo className="h-20 w-auto" />
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
              className={`w-full p-3 mt-8 text-white font-semibold rounded-xl transition duration-300 shadow-md ${isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
                }`}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full p-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition duration-300 flex items-center justify-center gap-3 shadow-sm"
          >
            <GoogleLogo />
            Continue with Google
          </button>

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
            src="/palm-recognition.png"
            alt="Login Illustration"
            className="w-full h-auto object-contain"
          />
        </div>

      </div>
    </div>
  );
}
