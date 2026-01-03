// Import necessary React hooks and router functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

// Main CreateAccount component - handles user account creation
export default function CreateAccount() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State for form data - stores user input
  const [formData, setFormData] = useState({
    name: '',              // User's full name
    email: '',             // User's email address
    password: '',          // User's password
    confirmPassword: ''    // Password confirmation
  });
  
  // State for validation messages
  const [error, setError] = useState('');      // Error message display
  const [success, setSuccess] = useState('');  // Success message display
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Handle input field changes - updates form data state
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // Handle form submission and validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword } = formData;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      // Simulate account creation due to CORS issues
      const signupUsername = localStorage.getItem('signupUsername');
      const verifiedPhone = localStorage.getItem('verifiedPhone');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Account created successfully! (Demo mode)');
      
      // Clear stored data
      localStorage.removeItem('signupUsername');
      localStorage.removeItem('verifiedPhone');
      
      setTimeout(() => {
        navigate('/details');
      }, 2000);
    } catch (error) {
      console.error('Account creation error:', error);
      setError('Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Main container for account creation form */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          Create Your Account
        </h1>

        {/* Error message display */}
        {error && (
          <div className="mb-4 text-center text-red-700 bg-red-100 border border-red-400 rounded py-2">
            {error}
          </div>
        )}
        
        {/* Success message display */}
        {success && (
          <div className="mb-4 text-center text-green-700 bg-green-100 border border-green-400 rounded py-2">
            {success}
          </div>
        )}

        {/* Account creation form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Email address field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="******"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold rounded-lg shadow-md transition duration-300 ${
              isLoading 
                ? 'bg-gray-500 cursor-not-allowed text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
        </form>

        {/* Login link for existing users */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-amber-600 hover:underline font-medium"
          >
            Log in
          </button>
        </p>
        
      </div>
    </div>
  );
}
