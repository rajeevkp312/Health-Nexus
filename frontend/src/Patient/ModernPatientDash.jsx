import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Activity,
  FileText,
  MessageCircle,
  Phone,
  LogOut,
  Bell,
  Settings,
  User,
  Plus,
  Stethoscope,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export function ModernPatientDash() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
    fetchPatientInfo();
    fetchAppointments();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'patient') {
      navigate('/');
      return;
    }
  };

  const fetchPatientInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      setPatientInfo(JSON.parse(user));
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.get(`http://localhost:8000/api/app/p/${user.id}`);

      if (response.data.msg === "Success") {
        setAppointments(response.data.value);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // On error, show no appointments instead of mock data
      setAppointments([]);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                <p className="text-gray-600">Welcome back, {patientInfo?.name || 'Patient'}</p>
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
              <h2 className="text-3xl font-bold mb-2">Welcome to HealthNexus!</h2>
              <p className="text-blue-100 text-lg">
                Your health journey starts here. Manage appointments, view records, and stay connected with your healthcare team.
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Appointment</h3>
            <p className="text-gray-600 text-sm">Schedule a new appointment with your preferred doctor</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-gray-600 text-sm">View your medical history and test results</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat with Doctor</h3>
            <p className="text-gray-600 text-sm">Connect with your healthcare provider</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency</h3>
            <p className="text-gray-600 text-sm">Quick access to emergency services</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Book New
              </Button>
            </div>
            
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.doctorName}</h4>
                          <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          <p className="text-sm text-gray-500">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Health Summary & Quick Info */}
          <div className="space-y-6">
            {/* Health Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blood Type</span>
                  <span className="font-medium text-gray-900">{patientInfo?.bloodGroup || 'A+'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Age</span>
                  <span className="font-medium text-gray-900">{patientInfo?.age || '25'} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gender</span>
                  <span className="font-medium text-gray-900">{patientInfo?.gender || 'Male'}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Health checkup completed</p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lab results available</p>
                    <p className="text-xs text-gray-600">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Appointment scheduled</p>
                    <p className="text-xs text-gray-600">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Emergency Hotline</span>
                </div>
                <p className="text-lg font-bold text-red-900">+1 (555) 911-HELP</p>
                <p className="text-xs text-red-700">Available 24/7 for medical emergencies</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ModernPatientDash;
