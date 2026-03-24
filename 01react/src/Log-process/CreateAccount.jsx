import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api'; // withCredentials:true, proxied via Vite

export default function CreateAccount() {
  const navigate = useNavigate();
  const [logoVisible, setLogoVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', userRole: 'seller'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword, userRole } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const signupUsername = localStorage.getItem('signupUsername');
      const verifiedPhone = localStorage.getItem('verifiedPhone');

      // Step 1: Create account
      const signupRes = await API.post('/auth/signup', {
        userName: signupUsername || email.split('@')[0],
        email,
        name,
        mobile: verifiedPhone || '',
        userRole: userRole,
        password,
      });

      // Save user data from signup response
      const data = signupRes.data.data || signupRes.data;
      const user = data.user || data;
      
      if (user.id) {
        localStorage.setItem('userId', String(user.id));
        localStorage.setItem('userRole', user.userRole || userRole);
        localStorage.setItem('userName', user.userName || user.user_name);
        localStorage.setItem('userEmail', user.email);
      }

      // Save tokens
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      localStorage.removeItem('signupUsername');
      localStorage.removeItem('verifiedPhone');

      // Step 2: Login to establish session
      await API.post('/auth/login', { email, password });

      setSuccess('Account created successfully!');
      
      // Navigate based on role
      if (userRole === 'seller') {
        setTimeout(() => navigate('/details'), 1500);
      } else if (userRole === 'delivery_partner') {
        setTimeout(() => navigate('/details'), 1500);
      } else {
        // Customer goes directly to dashboard
        setTimeout(() => navigate('/dashboard'), 1500);
      }

    } catch (err) {
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(typeof raw === 'object' ? JSON.stringify(raw) : String(raw));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          {logoVisible && (
            <img
              src="/logo2.jpeg"
              alt="ZPIN Logo"
              className="h-16 w-auto"
              onError={() => setLogoVisible(false)}
            />
          )}
        </div>

        {/* Step progress bar — step 2 active */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Account', 'Business', 'GST', 'Bank'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 1
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : i < 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${i === 1 ? 'text-amber-600' : i < 1 ? 'text-green-600' : 'text-gray-400'
                  }`}>{step}</span>
              </div>
              {i < 4 && (
                <div className={`h-0.5 w-6 mb-3 rounded ${i < 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1 text-amber-600">
          Create Your Account
        </h1>
        <p className="text-center text-gray-500 text-sm mb-5">
          Step 2 of 5 — Set up your login credentials
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 text-center text-sm text-red-700 bg-red-50 border border-red-300 rounded-lg py-2 px-3">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 text-center text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg py-2 px-3">
            ✅ {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name" name="name" type="text"
              value={formData.name} onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="email" name="email" type="email"
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password" name="password" type="password"
              value={formData.password} onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-1">I want to</label>
            <select
              id="userRole" name="userRole"
              value={formData.userRole} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm bg-white"
            >
              <option value="customer">Buy Products (Customer)</option>
              <option value="seller">Sell Products (Seller)</option>
              <option value="delivery_partner">Deliver Orders (Delivery Partner)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/phone')}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
          >
            ← Back
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-amber-600 hover:underline font-medium">
            Log in
          </button>
        </p>

      </div>
    </div>
  );
}
