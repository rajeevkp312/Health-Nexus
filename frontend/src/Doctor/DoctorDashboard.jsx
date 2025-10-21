import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Star,
  Activity,
  User,
  Stethoscope,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DoctorSidenav from './DoctorSidenav';
import axios from 'axios';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    feedback: 0,
    suggestions: 0,
    complaints: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const initials = (doctorInfo?.name || doctorInfo?.username || 'D')
    ?.split(' ')
    .map(n => n && n[0])
    .filter(Boolean)
    .slice(0,2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    checkAuthentication();
    fetchDoctorStats();
    fetchDoctorInfo();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const doctor = localStorage.getItem('doctor');
    
    if (!token || (!user && !doctor)) {
      navigate('/');
      return;
    }

    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== 'doctor') {
        navigate('/');
        return;
      }
    }
  };

  const fetchDoctorInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      setDoctorInfo(JSON.parse(user));
    }
  };

  const resolveDoctorId = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorLS = JSON.parse(localStorage.getItem('doctor') || '{}');
    let doctorId = doctorLS._id || user.id; // Support both old and new systems
    if (!doctorLS._id && user?.email) {
      try {
        const allDocs = await axios.get('http://localhost:8000/api/doctor');
        if (allDocs.data?.value?.length) {
          const match = allDocs.data.value.find(d => d.email === user.email);
          if (match?._id) {
            localStorage.setItem('doctor', JSON.stringify(match));
            doctorId = match._id;
          }
        }
      } catch (e) {
        console.warn('Unable to resolve doctor by email', e);
      }
    }
    return doctorId;
  };

  const fetchDoctorStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const doctorId = await resolveDoctorId();
      const response = await axios.get(`http://localhost:8000/api/app/d/${doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let nextStats = {
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        feedback: 0,
        suggestions: 0,
        complaints: 0,
        totalPatients: 0
      };

      if (response.data?.msg === 'Success') {
        const apps = response.data.value || [];
        const norm = (s) => {
          const lc = String(s || '').toLowerCase();
          if (lc === 'scheduled') return 'pending';
          if (lc === 'confirmed') return 'confirmed';
          if (lc === 'cancelled' || lc === 'canceled') return 'cancelled';
          if (lc === 'completed' || lc === 'complete') return 'completed';
          return lc;
        };
        const counts = apps.reduce((acc, a) => {
          const st = norm(a.status);
          acc.total++;
          if (st === 'pending') acc.pending++;
          else if (st === 'confirmed') acc.confirmed++;
          else if (st === 'completed') acc.completed++;
          else if (st === 'cancelled') acc.cancelled++;
          return acc;
        }, { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });

        const uniquePatientIds = new Set(
          apps.map(a => typeof a.pid === 'string' ? a.pid : (a.pid?._id || null)).filter(Boolean)
        );

        nextStats = {
          ...nextStats,
          totalAppointments: counts.total,
          pendingAppointments: counts.pending,
          confirmedAppointments: counts.confirmed,
          completedAppointments: counts.completed,
          cancelledAppointments: counts.cancelled,
          totalPatients: uniquePatientIds.size,
        };
      }

      // Fetch feedback counts for dashboard
      try {
        const fbResp = await axios.get(`http://localhost:8000/api/feed/doctor/${doctorId}`);
        if (fbResp.data?.msg === 'Success') {
          const items = fbResp.data.value || [];
          nextStats.feedback = items.length;
          nextStats.suggestions = items.filter(f => f.type === 'Suggestion').length;
          nextStats.complaints = items.filter(f => f.type === 'Complain').length;
        }
      } catch (e) {
        // ignore feedback errors on dashboard
      }

      setStats((prev) => ({ ...prev, ...nextStats }));
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const statsCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Confirmed Appointments',
      value: stats.confirmedAppointments,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: Activity,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Cancelled Appointments',
      value: stats.cancelledAppointments,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Patient Feedback',
      value: stats.feedback,
      icon: Star,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Suggestions',
      value: stats.suggestions,
      icon: MessageSquare,
      color: 'bg-teal-500',
      textColor: 'text-teal-600'
    },
    {
      title: 'Complaints',
      value: stats.complaints,
      icon: MessageSquare,
      color: 'bg-pink-500',
      textColor: 'text-pink-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content - Mobile First */}
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />
        
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Compact Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2 sm:p-4 text-white shadow-lg mx-1 sm:mx-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-bold mb-1 truncate">Welcome to HealthNexus!</h2>
                <p className="text-blue-100 text-xs sm:text-sm truncate">
                  Your medical practice dashboard
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-1 ring-white bg-gray-200 flex items-center justify-center flex-shrink-0">
                {doctorInfo?.image ? (
                  <img src={doctorInfo.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-gray-800">{initials}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mx-1 sm:mx-0">
            <div
              onClick={() => navigate('/doctor/patients')}
              role="button"
              className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Patients</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div
              onClick={() => navigate('/doctor/pending-appointments')}
              role="button"
              className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border cursor-pointer hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div
              onClick={() => navigate('/doctor/completed-appointments')}
              role="button"
              className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border cursor-pointer hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
                </div>
                <div className="bg-green-600 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </div>
            
            <div
              onClick={() => navigate('/doctor/feedback')}
              role="button"
              className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border cursor-pointer hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Feedback</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.feedback}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button 
                onClick={() => navigate('/doctor/pending-appointments')}
                className="flex items-center justify-center space-x-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-2 sm:p-3 transition-colors"
              >
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <span className="text-xs sm:text-sm font-medium text-secondary">Pending Requests</span>
              </button>
              
              <button 
                onClick={() => navigate('/doctor/confirmed-appointments')}
                className="flex items-center justify-center space-x-2 bg-green-400 hover:bg-green-700 border border-green-700 rounded-lg p-2 sm:p-3 transition-colors"
              >
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white " />
                <span className="text-xs sm:text-sm font-medium text-white ">Confirmed</span>
              </button>
              
              <button 
                onClick={() => navigate('/doctor/feedback')}
                className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-2 sm:p-3 transition-colors"
              >
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-secondary">Feedback</span>
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Today's Schedule</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-400 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="bg-blue-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Morning Consultations</p>
                    <p className="text-xs text-gray-600">9:00 AM - 12:00 PM</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-black font-medium flex-shrink-0">{stats.pendingAppointments} pending</span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-200 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="bg-purple-200 rounded-full p-1 sm:p-2 flex-shrink-0">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">Afternoon Appointments</p>
                    <p className="text-xs text-green-100">2:00 PM - 6:00 PM</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-black font-medium flex-shrink-0">{stats.confirmedAppointments} confirmed</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Recent Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-green-600 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Consultation completed</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-blue-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">New appointment request</p>
                  <p className="text-xs text-gray-600">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-purple-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Patient feedback received</p>
                  <p className="text-xs text-gray-600">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
