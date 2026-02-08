import React, { useState } from 'react';

export default function Login({ onLogin, API }) {
  const [step, setStep] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', { username, password });

      if (response.data.requiresTwoFA) {
        setTempToken(response.data.temp_token);
        setStep('2fa');
      } else {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/verify-2fa', {
        temp_token: tempToken,
        token: twoFACode,
      });

      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || '2FA verification failed');
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-lg shadow">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">YC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Yellow Goat</h1>
          <p className="text-gray-600 mt-2">Login to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA}>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">2FA Code</label>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                placeholder="Enter 6-digit code"
                maxLength="6"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 mt-2">
                Enter the code from your authenticator app
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => setStep('login')}
              className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}