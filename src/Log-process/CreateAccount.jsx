import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Reusable InputField Component */
const InputField = ({ label, name, type = 'text', value, placeholder, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
    />
  </div>
);

/* FormWrapper Component */
const FormWrapper = ({ title, children, error, success }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">{title}</h1>
      {error && <div className="mb-4 text-center text-red-700 bg-red-100 border border-red-400 rounded py-2">{error}</div>}
      {success && <div className="mb-4 text-center text-green-700 bg-green-100 border border-green-400 rounded py-2">{success}</div>}
      {children}
    </div>
  </div>
);

export default function CreateAccount() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword } = formData;

    // Step 1: Check empty fields
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    // Step 2: Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    // Step 3: Check password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Step 4: Check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // All validations passed
    setSuccess('Account created successfully!');

    // Redirect after showing success message
    setTimeout(() => navigate('/details'), 1000);
  };

  return (
    <FormWrapper title="Create Your Account" error={error} success={success}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Full Name" name="name" value={formData.name} placeholder="John Doe" onChange={handleChange} />
        <InputField label="Email Address" name="email" type="email" value={formData.email} placeholder="you@example.com" onChange={handleChange} />
        <InputField label="Password" name="password" type="password" value={formData.password} placeholder="******" onChange={handleChange} />
        <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} placeholder="******" onChange={handleChange} />

        <button type="submit" className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition duration-300">
          Create Account
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="text-amber-600 hover:underline font-medium">
          Log in
        </button>
      </p>
    </FormWrapper>
  );
}
