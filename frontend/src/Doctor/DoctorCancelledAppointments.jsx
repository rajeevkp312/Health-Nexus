import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XCircle, 
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
  AlertTriangle,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';

export function DoctorCancelledAppointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
    fetchDoctorInfo();
    fetchCancelledAppointments();
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

  const normalizeStatus = (s) => {
    const lc = String(s || '').toLowerCase();
    if (lc === 'scheduled') return 'pending';
    if (lc === 'confirmed') return 'confirmed';
    if (lc === 'cancelled' || lc === 'canceled') return 'cancelled';
    if (lc === 'completed' || lc === 'complete') return 'completed';
    return lc;
  };

  const formatAge = (val) => {
    if (val === null || val === undefined) return 'N/A';
    const s = String(val).trim();
    if (!s) return 'N/A';
    return /^\d+$/.test(s) ? `${s} years` : s;
  };

  const formatGender = (val) => {
    if (val === null || val === undefined) return 'N/A';
    const s = String(val).trim();
    if (!s) return 'N/A';
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

  const fetchCancelledAppointments = async () => {
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
        const cancelledAppointments = allAppointments.filter(app => normalizeStatus(app.status) === 'cancelled');
        const enriched = await enrichAppointmentsWithPatient(cancelledAppointments);
        setAppointments(enriched);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointmentId) => {
    toast({
      title: "Reschedule Appointment",
      description: "Reschedule functionality will be available soon.",
      duration: 2000,
    });
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const resp = await axios.delete(`http://localhost:8000/api/app/${appointmentId}`);
      if (resp.data.msg === 'Success') {
        toast({
          title: 'Appointment Deleted',
          description: 'Record removed permanently.',
          duration: 2000,
        });
        setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
      } else {
        toast({
          title: 'Delete failed',
          description: resp.data.msg || 'Try again later',
          variant: 'destructive',
          duration: 2000,
        });
      }
    } catch (e) {
      console.error('Delete appointment error:', e);
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
      duration: 2000,
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
              <div className="bg-red-600 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <XCircle className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">Cancelled Appointments</h1>
                <p className="text-xs sm:text-base text-gray-600 truncate">Total: {appointments.length} appointments cancelled</p>
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white border border-red-700">
                          <XCircle className="h-4 w-4 mr-1 text-white" />
                          Cancelled
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Cancelled on {appointment.cancelledDate}</span>
                        </div>
                      </div>

                      {/* Patient Info Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-gray-100 rounded-full p-3">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.patientDetails?.name || appointment.pid?.name || 'N/A'}</h3>
                          <p className="text-sm text-gray-600">Patient ID: #{(typeof appointment.pid === 'string' ? appointment.pid : appointment.pid?._id) || appointment.patientDetails?._id || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Original Date & Time</p>
                              <p className="font-medium text-gray-900">{new Date(appointment.date).toLocaleDateString()} - {appointment.time || appointment.slot || 'Time not specified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium text-gray-900">{appointment.patientDetails?.email || appointment.pid?.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">{appointment.patientDetails?.phone || appointment.pid?.phone || appointment.patientPhone || appointment.pid?.number || 'N/A'}</p>
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
                              <p className="font-medium text-gray-900">{appointment.patientDetails?.bloodGroup || appointment.patientDetails?.bloodgrp || appointment.pid?.bloodGroup || appointment.pid?.bloodgrp || appointment.patientBloodGroup || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Address</p>
                              <p className="font-medium text-gray-900 text-sm">{appointment.patientDetails?.address || appointment.pid?.address || appointment.patientAddress || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient's Concern */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Patient's Concern</h4>
                        <p className="text-gray-700">{appointment.reason || appointment.description || 'General Consultation'}</p>
                      </div>

                      {/* Cancellation Reason */}
                      {appointment.cancelReason && (
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h4 className="font-medium text-red-900">Cancellation Reason</h4>
                          </div>
                          <p className="text-red-800">{appointment.cancelReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full md:w-auto md:ml-6 md:mt-0 mt-4 flex flex-col space-y-2">
                      <Button
                        onClick={() => handleReschedule(appointment._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Contact Patient",
                            description: "Opening contact options...",
                            duration: 2000,
                          });
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 w-full"
                        onClick={() => handleDeleteAppointment(appointment._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Cancelled Appointments</h3>
                <p className="text-gray-500">You don't have any cancelled appointments.</p>
              </div>
            )}
          </div>

          {/* Cancellation Analytics */}
          {appointments.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-red-600 rounded-full p-3 w-fit mx-auto mb-2">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                  <p className="text-sm text-gray-600">Total Cancelled</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 rounded-full p-3 w-fit mx-auto mb-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">12%</p>
                  <p className="text-sm text-gray-600">Cancellation Rate</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-2">
                    <RotateCcw className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">65%</p>
                  <p className="text-sm text-gray-600">Rescheduled</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorCancelledAppointments;
