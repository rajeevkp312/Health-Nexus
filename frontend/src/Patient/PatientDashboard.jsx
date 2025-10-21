import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Activity,
  Phone,
  User,
  Plus,
  Stethoscope,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import PatientSidenav from './PatientSidenav';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthentication();
    fetchPatientInfo();
    fetchAppointments();
  }, []);

  const checkAuthentication = () => {
    const userStr = localStorage.getItem('user');
    const patientStr = localStorage.getItem('patient');

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.role !== 'patient') {
          navigate('/');
        }
        return;
      } catch (e) {
        // If parsing fails, fall back to patient check
      }
    }

    if (patientStr) {
      return;
    }

    navigate('/');
  };

  const fetchPatientInfo = async () => {
    try {
      const user = localStorage.getItem('user');
      const patient = localStorage.getItem('patient');
      
      if (user) {
        const userData = JSON.parse(user);
        console.log('Patient Info from localStorage:', userData);
        setPatientInfo(userData);
        
        // If user data doesn't have complete profile, fetch from API
        if (!userData.bloodGroup || !userData.age || !userData.gender) {
          try {
            const response = await axios.get(`http://localhost:8000/api/auth/profile/${userData.id}`);
            if (response.data.success) {
              setPatientInfo(response.data.user);
            }
          } catch (apiError) {
            console.log('API fetch failed, using localStorage data');
          }
        }
      } else if (patient) {
        setPatientInfo(JSON.parse(patient));
      }
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patient = JSON.parse(localStorage.getItem('patient') || '{}');
      const patientId = (user && user.id) || (patient && (patient._id || patient.id));

      if (!patientId) {
        setAppointments([]);
        return;
      }
      
      const response = await axios.get(`http://localhost:8000/api/app/p/${patientId}`);

      if (response.data.msg === "Success") {
        setAppointments(response.data.value);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patient');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
      duration: 2000,
    });
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600 text-white';
      case 'pending': return 'bg-yellow-500 text-yellow-900';
      case 'completed': return 'bg-blue-500 text-blue-900';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-400 text-gray-800';
    }
  };

  // Normalize backend status values (Scheduled/Confirmed/Cancelled/Completed)
  const normalizeStatus = (s) => {
    if (!s) return 'unknown';
    const lc = String(s).toLowerCase();
    if (lc === 'scheduled') return 'pending';
    if (lc === 'confirmed') return 'confirmed';
    if (lc === 'cancelled' || lc === 'canceled') return 'cancelled';
    if (lc === 'completed' || lc === 'complete') return 'completed';
    return lc;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      {/* Main Content - Mobile First */}
      <div className="flex flex-col lg:flex-row">
        <PatientSidenav />
        
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-16 lg:pt-6 pb-4 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Compact Welcome Section */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg p-2 sm:p-4 text-white shadow-lg mx-1 sm:mx-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-bold mb-1 truncate">Welcome to HealthNexus!</h2>
                <p className="text-rose-100 text-xs sm:text-sm truncate">
                  Your health journey starts here
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <User className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3 mx-1 sm:mx-0">
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-1.5 sm:p-3 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 mb-0.5 truncate">Total</p>
                  <p className="text-sm sm:text-xl font-bold text-gray-900">{appointments.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-1 sm:p-1.5 flex-shrink-0 self-end sm:self-auto">
                  <Calendar className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 p-1.5 sm:p-3 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 mb-0.5 truncate">Pending</p>
                  <p className="text-sm sm:text-xl font-bold text-gray-900">
                    {appointments.filter(app => normalizeStatus(app.status) === 'pending').length}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-1 sm:p-1.5 flex-shrink-0 self-end sm:self-auto">
                  <Clock className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-1.5 sm:p-3 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 mb-0.5 truncate">Confirmed</p>
                  <p className="text-sm sm:text-xl font-bold text-gray-900">
                    {appointments.filter(app => normalizeStatus(app.status) === 'confirmed').length}
                  </p>
                </div>
                <div className="bg-green-600 rounded-full p-1 sm:p-1.5 flex-shrink-0 self-end sm:self-auto">
                  <Activity className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-1.5 sm:p-3 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 mb-0.5 truncate">Health Score</p>
                  <p className="text-sm sm:text-xl font-bold text-gray-900">85%</p>
                </div>
                <div className="bg-purple-100 rounded-full p-1 sm:p-1.5 flex-shrink-0 self-end sm:self-auto">
                  <Heart className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Compact Main Content */}
          <div className="space-y-2 sm:space-y-4 mx-1 sm:mx-0">
            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Recent Appointments</h3>
                <Button size="sm" onClick={() => navigate('/patient/request-appointment')} className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Book New</span>
                  <span className="sm:hidden">Book</span>
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {appointments.length > 0 ? (
                  appointments.slice(0, 2).map((appointment) => (
                    <div key={appointment._id} className="border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="bg-blue-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                            <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{appointment.doctorName || appointment.did?.name || 'N/A'}</h4>
                            <p className="text-xs text-gray-600 truncate">{appointment.slot}</p>
                            <p className="text-xs text-gray-500 truncate hidden sm:block">{appointment.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:text-right flex-shrink-0">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-secondary">{appointment.date}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(normalizeStatus(appointment.status))}`}>
                            {normalizeStatus(appointment.status).charAt(0).toUpperCase() + normalizeStatus(appointment.status).slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-sm">No appointments found</p>
                    <Button className="mt-2 sm:mt-3" size="sm" onClick={() => navigate('/patient/request-appointment')}>
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Book Your First Appointment
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Health Summary & Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {/* Health Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
                <h3 className="text-sm sm:text-lg font-bold text-black mb-2">Health Summary</h3>
                <div className="space-y-1.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-black">Blood Type:</span>
                    <span className="font-semibold text-secondary opacity-100 text-xs sm:text-sm">
                      {patientInfo?.bloodGroup || patientInfo?.bloodtype || 'O+'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-black">Age:</span>
                    <span className="font-semibold text-secondary opacity-100 text-xs sm:text-sm">
                      {patientInfo?.age || '28'} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-black">Gender:</span>
                    <span className="font-semibold text-secondary opacity-100 text-xs sm:text-sm">
                      {patientInfo?.gender || 'Male'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-black">Emergency:</span>
                    <span className="font-semibold text-secondary opacity-100 text-xs sm:text-sm">
                      {patientInfo?.emergencyContact || patientInfo?.phone || '+91 98765-43210'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-black">Email:</span>
                    <span className="font-semibold text-secondary opacity-100 text-xs sm:text-sm">
                      {patientInfo?.email || 'patient@healthnexus.com'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  <Button 
                    className="w-full justify-start text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-auto" 
                    variant="outline"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="truncate">View Appointments</span>
                  </Button>
                  <Button 
                    className="w-full justify-start text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-auto" 
                    variant="outline"
                    onClick={() => navigate('/patient/feedback')}
                  >
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="truncate">Feedback Center</span>
                  </Button>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 rounded-lg border border-red-200 p-2 sm:p-4 sm:col-span-2 lg:col-span-1">
                <h3 className="text-sm sm:text-lg font-semibold text-red-900 mb-2">Emergency</h3>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-red-900">Emergency Hotline</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-red-900">+1 (555) 911-HELP</p>
                  <p className="text-xs text-red-700">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
