import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Logo component
const ZipinLogo = ({ className = "h-20 w-auto" }) => {
  return (
    <img
      src="/logo2.jpeg"
      alt="ZPIN Logo"
      className={className}
    />
  );
};

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Authenticating with Google...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        // Handle error from backend
        if (error) {
          console.error('Auth error:', error);
          setStatus('error');
          
          const errorMessages = {
            'auth_failed': 'Authentication failed. Please try again.',
            'server_error': 'Server error occurred. Please try again later.',
            'invalid_client': 'OAuth configuration error. Please contact support.'
          };
          
          setMessage(errorMessages[error] || 'Authentication failed. Please try again.');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Handle successful authentication
        if (token && refreshToken) {
          // Store tokens
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', refreshToken);
          
          console.log('✅ Google OAuth successful');
          console.log('Token:', token.substring(0, 20) + '...');
          
          // Try to decode userId from JWT
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id || payload.userId || payload.sub;
            if (userId) {
              localStorage.setItem('userId', String(userId));
              console.log('✅ UserId saved:', userId);
            }
          } catch (e) {
            console.warn('Could not decode userId from token');
          }
          
          setStatus('success');
          setMessage('Login successful! Redirecting to dashboard...');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // No token received
          setStatus('error');
          setMessage('No authentication token received. Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <ZipinLogo />
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand"></div>
          )}
          
          {status === 'success' && (
            <div className="rounded-full h-16 w-16 bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="rounded-full h-16 w-16 bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center">
          <h2 className={`text-xl font-semibold mb-2 ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 
            'text-gray-800'
          }`}>
            {status === 'processing' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h2>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Manual redirect button for errors */}
        {status === 'error' && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="w-full p-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand transition duration-300"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
