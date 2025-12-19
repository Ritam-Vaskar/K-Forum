import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, X } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationOTP, setVerificationOTP] = useState('');
  const [userId, setUserId] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState('email');
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5001';
      console.log('Attempting login to:', `${apiUrl}/api/auth/login`);

      const response = await axios.post(`${apiUrl}/api/auth/login`, formData);
      console.log('Login response:', response.data);

      if (response.data.requiresVerification) {
        setUserId(response.data.userId);
        setShowVerification(true);
        toast.error('Please verify your email to continue');
      } else {
        login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error full object:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request (no response):', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      toast.error(error.response?.data?.message || 'Login failed - Check console for details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/auth/verify-otp`, {
        userId,
        otp: verificationOTP
      });
      login(response.data.user, response.data.token);
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5001';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email: 'dummy@kiit.ac.in',
        password: 'dummy123'
      });
      login(response.data.user, response.data.token);
      toast.success('Demo login successful!');
      navigate('/');
    } catch (error) {
      console.error('Demo login error:', error);

      // Fail-safe: Client-side Login Bypass
      // If server is unreachable or fails, force login as Demo User locally
      console.log('Attempting client-side fallback login...');
      const fallbackUser = {
        _id: 'dummy_id_fallback', // This ID might not match DB, but allows UI access
        name: 'Demo User (Offline Mode)',
        email: 'dummy@kiit.ac.in',
        role: 'student',
        studentId: '9999999',
        year: 4,
        branch: 'CSE',
        isVerified: true,
        reputation: 0
      };

      login(fallbackUser, 'dummy-demo-token');
      toast.success('Entered Demo Mode (Offline/Bypass)');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your K-Forum account</p>
          </div>

          {!showVerification ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  KIIT Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors"
                    placeholder="your.email@kiit.ac.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#17d059] hover:text-emerald-400 focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#17d059] to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-[#15b84f] hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-[#17d059]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Demo Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={verificationOTP[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^\d*$/.test(value)) return;

                        const newOTP = verificationOTP.split('');
                        newOTP[index] = value;
                        setVerificationOTP(newOTP.join(''));

                        if (value && index < 5) {
                          const nextInput = e.target.parentElement.children[index + 1];
                          nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !verificationOTP[index] && index > 0) {
                          const prevInput = e.target.parentElement.children[index - 1];
                          prevInput.focus();
                        }
                      }}
                      className="w-full h-12 bg-gray-700 text-white text-center text-xl rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors"
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Please enter the verification code sent to your email
              </p>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={loading || verificationOTP.length !== 6}
                  className="w-full bg-gradient-to-r from-[#17d059] to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-[#15b84f] hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-[#17d059]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationOTP('');
                  }}
                  className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#17d059] hover:text-emerald-400 font-medium">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetStep('email');
                setResetEmail('');
                setResetOTP('');
                setNewPassword('');
                setUserId(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {resetStep === 'email' && 'Reset Password'}
              {resetStep === 'otp' && 'Enter Reset Code'}
              {resetStep === 'newPassword' && 'Set New Password'}
            </h2>

            {resetStep === 'email' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setResetLoading(true);
                try {
                  const response = await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/auth/forgot-password`, {
                    email: resetEmail
                  });
                  setUserId(response.data.userId);
                  setResetStep('otp');
                  toast.success('Reset code sent to your email');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Failed to send reset code');
                } finally {
                  setResetLoading(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-[#17d059] to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-[#15b84f] hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-[#17d059]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {resetStep === 'otp' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (resetOTP.length !== 6) {
                  toast.error('Please enter a valid 6-digit code');
                  return;
                }
                setResetStep('newPassword');
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reset Code</label>
                  <input
                    type="text"
                    value={resetOTP}
                    onChange={(e) => setResetOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none"
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#17d059] to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-[#15b84f] hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-[#17d059]/50"
                >
                  Verify Code
                </button>
              </form>
            )}

            {resetStep === 'newPassword' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setResetLoading(true);
                try {
                  await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/auth/reset-password`, {
                    userId,
                    otp: resetOTP,
                    newPassword
                  });
                  toast.success('Password reset successful');
                  setShowForgotPassword(false);
                  setResetStep('email');
                  setResetEmail('');
                  setResetOTP('');
                  setNewPassword('');
                  setUserId(null);
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Failed to reset password');
                } finally {
                  setResetLoading(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-[#17d059] to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-[#15b84f] hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-[#17d059]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;