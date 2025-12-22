import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ZipinLogo = ({ className = "h-8 w-auto" }) => (
  <div className={`flex items-center justify-center font-['Bungee',cursive] text-2xl font-bold text-amber-500 ${className}`}>
    ZPIN
  </div>
);

const AlertBox = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
      <div className={`${styles[type]} p-4 rounded-lg border shadow-lg max-w-sm w-full flex items-center justify-between`}>
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="font-bold hover:opacity-75">&times;</button>
      </div>
    </div>
  );
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!email || !password) {
      setAlertMessage('Email/Username and Password are required.');
      setAlertType('error');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });

      setAlertMessage('Login successful!');
      setAlertType('success');

      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setAlertMessage('Login failed. Please check credentials.');
      setAlertType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <AlertBox message={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <ZipinLogo className="h-10 w-auto mb-6" />
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome Back!</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username"
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border rounded-lg"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-semibold ${
                isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-amber-500/10 items-center justify-center">
          <img src="https://placehold.co/500x500" alt="Login" />
        </div>
      </div>
    </div>
  );
}
