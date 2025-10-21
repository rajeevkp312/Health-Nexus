import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Calendar, MapPin, Droplets, UserCheck, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export function AuthModal({ isOpen, onClose, redirectTo, defaultRole }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: '',
    rememberMe: false
  });

  // Pre-select role if provided (e.g., patient for booking flow)
  useEffect(() => {
    if (defaultRole && !loginData.role) {
      setLoginData(prev => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole, loginData.role]);

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: ''
  });

  // OTP verification state
  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
    userData: null
  });

  // Forgot password state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: ''
  });

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const clearImpersonationFlags = () => {
      try {
        localStorage.removeItem('impersonatedByAdmin');
        localStorage.removeItem('impersonateRole');
        localStorage.removeItem('impersonateBy');
        if (localStorage.getItem('token') === 'admin-impersonation') {
          localStorage.removeItem('token');
        }
      } catch {}
    };

    // Safety: clear any stale impersonation markers before login
    clearImpersonationFlags();

    try {
      // Try new authentication system first
      const response = await axios.post('http://localhost:8000/api/auth/login', loginData);
      
      if (response.data.success) {
        clearImpersonationFlags();
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast({
          title: "Login Successful! 🎉",
          description: `Welcome back, ${response.data.user.name}!`,
        });
        
        onClose();
        
        // Role-based redirection
        console.log('User role:', response.data.user.role);
        if (response.data.user.role === 'doctor') {
          console.log('Redirecting to doctor portal...');
          setTimeout(() => {
            window.location.href = '/doctor';
          }, 500);
        } else if (response.data.user.role === 'patient') {
          // Clear any legacy/stale patient object to prevent wrong IDs being used
          try { localStorage.removeItem('patient'); } catch {}
          if (redirectTo) {
            console.log('Redirecting to post-login target:', redirectTo);
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 500);
          } else {
            console.log('Redirecting to patient portal...');
            setTimeout(() => {
              window.location.href = '/patient';
            }, 500);
          }
        }
      }
    } catch (error) {
      // If new system fails, try fallback systems based on role
      if (loginData.role === 'doctor') {
        try {
          const doctorResponse = await axios.post('http://localhost:8000/api/doctor/log', {
            email: loginData.email,
            password: loginData.password
          });
          
          if (doctorResponse.data.msg === "Success") {
            console.log('Doctor login successful:', doctorResponse.data);
            
            // Get doctor details
            const doctorDetailsResponse = await axios.get('http://localhost:8000/api/doctor');
            console.log('Doctor details response:', doctorDetailsResponse.data);
            
            const doctor = doctorDetailsResponse.data.value.find(d => d._id === doctorResponse.data.id);
            console.log('Found doctor:', doctor);
            
            if (doctor) {
              clearImpersonationFlags();
              // Create user object compatible with new system
              const userData = {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                role: 'doctor',
                phone: doctor.phone,
                specialty: doctor.specialty,
                qualification: doctor.qualification,
                experience: doctor.experience
              };
              
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('doctor', JSON.stringify(doctor)); // Store full doctor object
              localStorage.setItem('token', 'doctor_token_' + doctor._id); // Create a token
              
              toast({
                title: "Login Successful! 🎉",
                description: `Welcome back, Dr. ${doctor.name}!`,
              });
              
              onClose();
              
              // Force redirect with timeout
              console.log('Redirecting to /doctor...');
              setTimeout(() => {
                window.location.href = '/doctor';
              }, 500);
              return;
            }
          }
        } catch (doctorError) {
          console.error('Doctor login error:', doctorError);
        }
      } else if (loginData.role === 'patient') {
        try {
          // Try patient login with admin API
          console.log('🔍 Trying patient login with credentials:', {
            email: loginData.email,
            password: loginData.password,
            role: loginData.role
          });
          
          const patientResponse = await axios.get('http://localhost:8000/api/admin/patients');
          console.log('📡 Patient API response:', patientResponse.data);
          console.log('📊 Response structure:', {
            hasMsg: !!patientResponse.data.msg,
            msgValue: patientResponse.data.msg,
            hasValue: !!patientResponse.data.value,
            valueLength: patientResponse.data.value?.length || 0,
            firstPatient: patientResponse.data.value?.[0] || null
          });
          
          if (patientResponse.data.msg === "Success") {
            console.log('✅ API Success, searching for patient...');
            
            // Check if value exists and is an array
            const patientData = patientResponse.data.value || patientResponse.data.patients || [];
            console.log('📋 Patient data array:', patientData);
            
            if (!Array.isArray(patientData)) {
              console.error('❌ Patient data is not an array:', patientData);
              throw new Error('Invalid patient data format');
            }
            
            const patient = patientData.find(p => {
              // Normalize data for comparison
              const patientEmail = (p.email || '').toLowerCase().trim();
              const patientPassword = (p.password || '').trim();
              const loginEmail = (loginData.email || '').toLowerCase().trim();
              const loginPassword = (loginData.password || '').trim();
              
              console.log('🔍 Checking patient:', {
                originalPatientEmail: p.email,
                originalPatientPassword: p.password,
                normalizedPatientEmail: patientEmail,
                normalizedPatientPassword: patientPassword,
                loginEmail: loginEmail,
                loginPassword: loginPassword,
                emailMatch: patientEmail === loginEmail,
                passwordMatch: patientPassword === loginPassword,
                fullPatientObject: p
              });
              
              return patientEmail === loginEmail && patientPassword === loginPassword;
            });
            console.log('🎯 Found patient:', patient);
            
            if (patient) {
              clearImpersonationFlags();
              // Create user object compatible with new system
              const userData = {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                role: 'patient',
                phone: patient.phone,
                age: patient.age,
                gender: patient.gender,
                bloodGroup: patient.bloodGroup,
                address: patient.address
              };
              
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('patient', JSON.stringify(patient)); // Store full patient object
              localStorage.setItem('token', 'patient_token_' + patient._id); // Create a token
              
              toast({
                title: "Login Successful! 🎉",
                description: `Welcome back, ${patient.name}!`,
              });
              
              onClose();
              
              // Force redirect with timeout
              if (redirectTo) {
                console.log('Redirecting to post-login target:', redirectTo);
                setTimeout(() => {
                  window.location.href = redirectTo;
                }, 500);
              } else {
                console.log('Redirecting to /patient...');
                setTimeout(() => {
                  window.location.href = '/patient';
                }, 500);
              }
              return;
            }
          }
        } catch (patientError) {
          console.error('❌ Patient login error:', patientError);
          console.error('❌ Error details:', {
            message: patientError.message,
            response: patientError.response?.data,
            status: patientError.response?.status
          });
        }
      }
      
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', registerData);
      
      if (response.data.success) {
        setOtpData({
          email: response.data.email,
          otp: '',
          userData: registerData
        });
        setShowOTPVerification(true);
        toast({
          title: "OTP Sent! 📧",
          description: "Please check your email for the verification code.",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/verify-otp', otpData);
      
      if (response.data.success) {
        toast({
          title: "Registration Successful! 🎉",
          description: `Welcome to HealthNexus, ${response.data.user.name}! Please login to continue.`,
        });
        
        // Reset to login tab after successful registration
        setShowOTPVerification(false);
        setActiveTab('login');
        
        // Clear registration data
        setRegisterData({
          name: '',
          email: '',
          password: '',
          phone: '',
          age: '',
          gender: '',
          bloodGroup: '',
          address: ''
        });
        setOtpData({
          email: '',
          otp: '',
          userData: null
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Invalid OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/forgot-password', {
        email: forgotPasswordData.email
      });
      
      if (response.data.success) {
        setShowResetPassword(true);
        toast({
          title: "OTP Sent! 📧",
          description: "Please check your email for the reset code.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/reset-password', forgotPasswordData);
      
      if (response.data.success) {
        setShowForgotPassword(false);
        setShowResetPassword(false);
        setActiveTab('login');
        
        toast({
          title: "Password Reset Successful! ✅",
          description: "You can now login with your new password.",
        });
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {showOTPVerification ? 'Email Verification' : 
                 showForgotPassword ? 'Forgot Password' : 
                 'HealthNexus Portal'}
              </h2>
              <p className="text-blue-100 text-sm">
                {showOTPVerification ? 'Enter the OTP sent to your email' : 
                 showForgotPassword ? 'Reset your account password' : 
                 'Access your healthcare account'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          {showOTPVerification ? (
            // OTP Verification Form
            <form onSubmit={handleOTPVerification} className="space-y-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={otpData.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Verification Code *
                </label>
                <input
                  type="text"
                  value={otpData.otp}
                  onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
                <></>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full !bg-green-500 !text-white hover:!bg-green-600 font-semibold py-3 rounded-xl mt-6"
              >
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </Button>

              <Button
                type="button"
                onClick={() => setShowOTPVerification(false)}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
              >
                Back to Registration
              </Button>
            </form>
          ) : showForgotPassword ? (
            // Forgot Password Form
            <form onSubmit={showResetPassword ? handleResetPassword : handleForgotPassword} className="space-y-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                  disabled={showResetPassword}
                />
              </div>

              {showResetPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Verification Code *
                    </label>
                    <input
                      type="text"
                      value={forgotPasswordData.otp}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, otp: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full !bg-blue-500 !text-white hover:!bg-blue-600 font-semibold py-3 rounded-xl mt-6"
              >
                {loading ? 'Processing...' : showResetPassword ? 'Reset Password' : 'Send Reset Code'}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowResetPassword(false);
                  setActiveTab('login');
                }}
                variant="outline"
                className="w-full border-gray-300 !text-blue-700 hover:!text-blue-800 !bg-white hover:!bg-blue-50 py-3 rounded-xl"
              >
                Back to Login
              </Button>
            </form>
          ) : (
            // Login/Register Tabs
            <>
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'register'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {activeTab === 'login' ? (
                // Login Form
                <form onSubmit={handleLogin} className="space-y-4 bg-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserCheck className="h-4 w-4 inline mr-1" />
                      Login as *
                    </label>
                    <select
                      name="role"
                      value={loginData.role}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    >
                      <option value="">Select your role</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={loginData.rememberMe}
                        onChange={handleLoginChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full !bg-blue-500 !text-white hover:!bg-blue-600 font-semibold py-3 rounded-xl mt-6"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              ) : (
                // Registration Form
                <form onSubmit={handleRegister} className="space-y-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={registerData.age}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Droplets className="h-4 w-4 inline mr-1" />
                      Blood Group *
                    </label>
                    <select
                      name="bloodGroup"
                      value={registerData.bloodGroup}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={registerData.address}
                      onChange={handleRegisterChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={registerData.emergencyContact}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Emergency contact number (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Medical History
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={registerData.medicalHistory}
                        onChange={handleRegisterChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Any medical history (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Heart className="h-4 w-4 inline mr-1" />
                        Allergies
                      </label>
                      <textarea
                        name="allergies"
                        value={registerData.allergies}
                        onChange={handleRegisterChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Any known allergies (optional)"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full !bg-green-500 !text-white hover:!bg-green-600 font-semibold py-3 rounded-xl mt-6"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Note */}
          {!showOTPVerification && !showForgotPassword && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> {activeTab === 'register' 
                  ? 'You will receive a verification email after registration.' 
                  : 'Your data is secure and encrypted.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
