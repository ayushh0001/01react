import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword } = formData;

    // Validation checks
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

    // All validations passed
    setSuccess('Account created successfully!');
    
    // Redirect after showing success message for 1 second
    setTimeout(() => {
      navigate('/details');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">Create Your Account</h1>

        {/* Validation messages */}
        {error && (
          <div className="mb-4 text-center text-red-700 bg-red-100 border border-red-400 rounded py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-center text-green-700 bg-green-100 border border-green-400 rounded py-2">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
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

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300"
          >
            Create Account
          </button>
        </form>

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
