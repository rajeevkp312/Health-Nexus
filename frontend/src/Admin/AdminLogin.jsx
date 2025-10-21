import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield,
  ArrowRight,
  AlertCircle,
  X,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState('request');
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpMsg, setFpMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const openForgot = (e) => {
    e.preventDefault();
    setFpOpen(true);
    setFpStep('request');
    setFpEmail(formData.email || '');
    setFpOtp('');
    setFpNewPassword('');
    setFpError('');
    setFpMsg('');
  };

  const handleSendOTP = async () => {
    if (!fpEmail) { setFpError('Please enter your email'); return; }
    setFpLoading(true); setFpError(''); setFpMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail })
      });
      const data = await res.json();
      if (data.msg === 'Success' || data.success) {
        setFpMsg('OTP sent to your email');
        setFpStep('verify');
      } else if (data.msg === 'not found') {
        setFpError('Admin not found');
      } else {
        setFpError(data.msg || 'Failed to send OTP');
      }
    } catch (_) {
      setFpError('Network error. Please try again.');
    }
    setFpLoading(false);
  };

  const handleResetPassword = async () => {
    if (!fpEmail || !fpOtp || !fpNewPassword) { setFpError('All fields are required'); return; }
    setFpLoading(true); setFpError(''); setFpMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword })
      });
      const data = await res.json();
      if (data.msg === 'Success' || data.success) {
        setFpMsg('Password reset successfully');
        setTimeout(() => {
          setFpOpen(false);
        }, 1200);
      } else {
        setFpError(data.msg || 'Failed to reset password');
      }
    } catch (_) {
      setFpError('Network error. Please try again.');
    }
    setFpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend API for authentication
      const response = await fetch('http://localhost:8000/api/admin/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.msg === 'Success') {
        localStorage.setItem('admin', formData.email);
        navigate('/admin/dash');
      } else {
        setError(data.msg === 'not found' ? 'Admin not found' : 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-4">
              <img 
                src="/src/assets/logo2.png" 
                alt="HealthNexus Logo" 
                className="h-12 w-auto"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">HealthNexus Admin</h1>
          <p className="text-blue-100">Secure access to admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-white border border-red-300 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-400 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-blue-100">Remember me</span>
              </label>
              <a href="#" onClick={openForgot} className="text-sm text-blue-200 hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

        </div>

        {/* Back to Website */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-200 hover:text-white transition-colors text-sm flex items-center justify-center space-x-2 mx-auto"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to HealthNexus Website</span>
          </button>
        </div>

        {fpOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button onClick={() => setFpOpen(false)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Reset Admin Password</h2>
              <p className="text-gray-500 text-sm mb-4">Enter your email to receive OTP, then reset your password.</p>

              {fpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 text-sm">{fpError}</span>
                </div>
              )}
              {fpMsg && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm mb-3">
                  {fpMsg}
                </div>
              )}

              {fpStep === 'request' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" placeholder="admin@gmail.com" />
                    </div>
                  </div>
                  <Button disabled={fpLoading} onClick={handleSendOTP} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                    {fpLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={fpEmail} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input type="text" value={fpOtp} onChange={e => setFpOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" placeholder="Enter 6-digit OTP" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input type="password" value={fpNewPassword} onChange={e => setFpNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" placeholder="Enter new password" />
                    </div>
                  </div>
                  <Button disabled={fpLoading} onClick={handleResetPassword} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                    {fpLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                  <button onClick={() => setFpStep('request')} className="w-full text-sm text-gray-600 hover:text-gray-800">Back</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminLogin;
