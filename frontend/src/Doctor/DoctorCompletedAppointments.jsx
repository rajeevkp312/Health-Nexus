import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  CheckCircle, 
  LogOut,
  Bell,
  Settings,
  User,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';

export function DoctorCompletedAppointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
    fetchDoctorInfo();
    fetchCompletedAppointments();
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

  const safe = (v, fallback = '—') => {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    if (!s || s.toLowerCase() === 'n/a') return fallback;
    return v;
  };

  const formatDate = (d) => {
    try {
      if (!d) return '—';
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '—';
      return dt.toLocaleDateString('en-GB');
    } catch { return '—'; }
  };

  const normalizeStatus = (s) => {
    const lc = String(s || '').toLowerCase();
    if (lc === 'scheduled') return 'pending';
    if (lc === 'confirmed') return 'confirmed';
    if (lc === 'cancelled' || lc === 'canceled') return 'cancelled';
    if (lc === 'completed' || lc === 'complete') return 'completed';
    return lc;
  };

  const formatAge = (val) => {
    if (val === null || val === undefined) return '—';
    const s = String(val).trim();
    if (!s || s.toLowerCase() === 'n/a') return '—';
    return /^\d+$/.test(s) ? `${s} years` : s;
  };

  const formatGender = (val) => {
    if (val === null || val === undefined) return '—';
    const s = String(val).trim();
    if (!s || s.toLowerCase() === 'n/a') return '—';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const enrichAppointmentsWithPatient = async (list) => {
    const enriched = await Promise.all((list || []).map(async (app) => {
      const pidStr = typeof app.pid === 'string' ? app.pid : (app.pid?._id || null);
      if (!pidStr) return app;
      try {
        const patResp = await axios.get(`http://localhost:8000/api/patient/${pidStr}`);
        if (patResp.data?.msg === 'Success' && patResp.data?.value) {
          return { ...app, patientDetails: patResp.data.value };
        }
      } catch {}
      return app;
    }));
    return enriched;
  };

  const fetchCompletedAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
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
      
      const response = await axios.get(`http://localhost:8000/api/app/d/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.msg === "Success") {
        const allAppointments = response.data.value || [];
        const completedAppointments = allAppointments.filter(app => normalizeStatus(app.status) === "completed");
        const enriched = await enrichAppointmentsWithPatient(completedAppointments);
        setAppointments(enriched);
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
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
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
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />
        
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-purple-100 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">Completed Appointments</h1>
                <p className="text-xs sm:text-base text-gray-600 truncate">Total: {appointments.length} appointments completed</p>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-2 sm:space-y-4 mx-1 sm:mx-0">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div key={appointment._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-blue-800 border border-blue-200 ">
                          <CheckCircle className="h-4 w-4 mr-1"/>
                          Completed
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Completed on {formatDate(appointment.completedDate || appointment.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Patient Info Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{safe(appointment.patientDetails?.name || appointment.pid?.name || appointment.patientName, 'Unknown Patient')}</h3>
                          <p className="text-sm text-gray-600">Patient ID: #{safe((typeof appointment.pid === 'string' ? appointment.pid : appointment.pid?._id) || appointment.patientDetails?._id)}</p>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Date & Time</p>
                              <p className="font-medium text-gray-900">{formatDate(appointment.date)} - {safe(appointment.time || appointment.slot, 'Time not specified')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium text-gray-900">{safe(appointment.patientDetails?.email || appointment.pid?.email || appointment.patientEmail)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">{safe(appointment.patientDetails?.phone || appointment.pid?.phone || appointment.patientPhone || appointment.pid?.number)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Age & Gender</p>
                              <p className="font-medium text-gray-900">{formatAge(appointment.patientDetails?.age || appointment.pid?.age || appointment.patientAge)}, {formatGender(appointment.patientDetails?.gender || appointment.pid?.gender || appointment.patientGender)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Stethoscope className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Blood Group</p>
                              <p className="font-medium text-gray-900">{safe(appointment.patientDetails?.bloodGroup || appointment.patientDetails?.bloodgrp || appointment.pid?.bloodGroup || appointment.pid?.bloodgrp || appointment.patientBloodGroup)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Address</p>
                              <p className="font-medium text-gray-900 text-sm">{safe(appointment.patientDetails?.address || appointment.pid?.address || appointment.patientAddress)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient's Concern */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Patient's Concern</h4>
                        <p className="text-gray-700">{appointment.reason || appointment.description || 'General Consultation'}</p>
                      </div>

                      {/* Consultation Notes */}
                      {appointment.notes && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium text-blue-900">Consultation Notes</h4>
                          </div>
                          <p className="text-blue-800">{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full md:w-auto md:ml-6 md:mt-0 mt-4 flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/doctor/report/${appointment._id}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Report
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Contact Patient",
                            description: "Opening contact options...",
                          });
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Schedule Follow-up",
                            description: "Opening follow-up scheduling...",
                          });
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Follow-up
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Appointments</h3>
                <p className="text-gray-500">You haven't completed any appointments yet.</p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {appointments.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-2">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                  <p className="text-sm text-gray-600">Total Completed</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-2">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-2">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">45m</p>
                  <p className="text-sm text-gray-600">Avg. Duration</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorCompletedAppointments;
