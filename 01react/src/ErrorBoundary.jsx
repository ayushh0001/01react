import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }
  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Fallback component to display when error occurs
function ErrorFallback({ error }) {
  const navigate = useNavigate();

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

        {/* Error Circle */}
        <div className="flex justify-center mb-8">
          <div className="w-64 h-64 rounded-full border-8 border-red-500 flex items-center justify-center">
            <svg className="w-32 h-32 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Error title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Application Error
        </h2>

        {/* Error message */}
        <p className="text-gray-600 mb-4 max-w-lg mx-auto">
          An unexpected error occurred. Please try again.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.toString()}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Reload Page
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
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}

export default ErrorBoundary;
