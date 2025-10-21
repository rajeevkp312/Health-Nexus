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
  LogOut,
  Bell,
  Settings,
  User,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export function ModernDoctorDash() {
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
    complaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    checkAuthentication();
    fetchDoctorStats();
    fetchDoctorInfo();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'doctor') {
      navigate('/');
      return;
    }
  };

  const fetchDoctorInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      setDoctorInfo(JSON.parse(user));
    }
  };

  const fetchDoctorStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // This is a placeholder - you'll need to create this API endpoint
      const response = await axios.get(`http://localhost:8000/api/doctor/stats/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
      // Set mock data for now
      setStats({
        totalAppointments: 45,
        pendingAppointments: 8,
        confirmedAppointments: 12,
        completedAppointments: 20,
        cancelledAppointments: 5,
        feedback: 15,
        suggestions: 3,
        complaints: 1
      });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-600">Welcome back, Dr. {doctorInfo?.name || 'Doctor'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700 border-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!</h2>
              <p className="text-blue-100 text-lg">
                You have {stats.pendingAppointments} pending appointments today
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} rounded-full p-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/doctor/appointments')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/doctor/patients')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Patients
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/doctor/feedback')}
              >
                <Star className="h-4 w-4 mr-2" />
                View Feedback
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Morning Rounds</p>
                  <p className="text-sm text-gray-600">9:00 AM - 12:00 PM</p>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Patient Consultations</p>
                  <p className="text-sm text-gray-600">2:00 PM - 6:00 PM</p>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Appointment completed</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New appointment scheduled</p>
                  <p className="text-xs text-gray-600">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New patient feedback</p>
                  <p className="text-xs text-gray-600">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ModernDoctorDash;
