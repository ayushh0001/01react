import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error details from location state if available
  const errorMessage = location.state?.message || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
  const errorCode = location.state?.code || '404';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl text-center">
        
        {/* Error heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Error
        </h1>
        <p className="text-gray-500 mb-12">
          Oops! Something went wrong.
        </p>

        {/* 404 Circle */}
        <div className="flex justify-center mb-8">
          <div className="w-64 h-64 rounded-full border-8 border-amber-500 flex items-center justify-center">
            <span className="text-8xl font-bold text-amber-500">
              {errorCode}
            </span>
          </div>
        </div>

        {/* Page Not Found */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Page Not Found
        </h2>

        {/* Error message */}
        <p className="text-gray-600 mb-12 max-w-lg mx-auto">
          {errorMessage}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition duration-200"
          >
            Go to Home
          </button>
        </div>

        {/* Additional help text */}
        <p className="text-sm text-gray-400 mt-12">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}
