/**
 * Login Page
 */
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store/useAuthStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    // Basic validation
    if (!email || !password) {
      setValidationError('Email and password are required');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Sign in to your Odyssey account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4CE14] text-on-surface"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4CE14] text-on-surface"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Error Messages */}
          {(validationError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {validationError || error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#379777] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
