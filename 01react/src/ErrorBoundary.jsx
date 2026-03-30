import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Application Error</h1>
        <p className="text-gray-500 mb-8">Oops! Something went wrong.</p>

        <div className="flex justify-center mb-8">
          <div className="w-48 h-48 rounded-full border-8 border-red-500 flex items-center justify-center">
            <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
            <p className="text-sm font-mono text-red-800 break-all">{error.toString()}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Reload Page
          </button>
          <button
            onClick={() => { onReset(); window.location.href = '/'; }}
            className="px-8 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand transition"
          >
            Go to Home
          </button>
        </div>

        <p className="text-sm text-gray-400 mt-8">If this problem persists, please contact support.</p>
      </div>
    </div>
  );
}

export default ErrorBoundary;
