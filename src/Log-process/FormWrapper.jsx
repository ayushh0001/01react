import React from 'react';

/**
 * FormWrapper Component
 * Props:
 * - title: string (form ka title)
 * - description: string (form ke niche description)
 * - children: JSX (form fields)
 * - error: string (error message)
 * - message: string (success message)
 */
const FormWrapper = ({ title, description, children, error, message }) => {
  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 overflow-hidden flex flex-col md:flex-row">
      
      {/* Left: Form Section */}
      <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-amber-600 mb-4 text-center">{title}</h1>
        {description && (
          <p className="text-center text-gray-500 mb-6 text-sm">{description}</p>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 text-center text-sm text-red-700 bg-red-100 border border-red-400 rounded py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-400 rounded py-2">
            {message}
          </div>
        )}

        {/* Form fields */}
        {children}
      </div>

      {/* Right: Illustration Section */}
      <div className="hidden md:flex md:w-1/2 bg-amber-500/10 items-center justify-center p-8">
        <img
          src="https://placehold.co/500x500/fccf03/242424?text=Form+Illustration"
          alt="Form Illustration"
          className="w-full h-auto object-contain rounded-lg shadow-lg"
          onError={(e) => (e.target.src = 'https://placehold.co/500x500/fccf03/242424?text=Form+Illustration')}
        />
      </div>
    </div>
  );
};

export default FormWrapper;
