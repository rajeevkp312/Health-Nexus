import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Heart, 
  LogOut,
  Bell,
  Settings,
  User,
  Plus,
  Stethoscope,
  Edit,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import PatientSidenav from './PatientSidenav';
import { AppointmentDetailsModal } from '../components/AppointmentDetailsModal';

export function PatientAppointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    console.log('PatientAppointments component mounted');
    const authResult = checkAuthentication();
    if (authResult !== false) {
      fetchPatientInfo();
      fetchAppointments();
    }
  }, []);

  // Helper function to safely display values
  const safe = (v, fallback = '—') => {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    if (!s || s.toLowerCase() === 'n/a') return fallback;
    return v;
  };

  // Refresh appointments when component becomes visible (e.g., after booking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAppointments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const checkAuthentication = () => {
    try {
      // Check for new authentication system
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'patient') return true;
      
      // Check for legacy patient authentication
      if (localStorage.getItem('patient')) return true;
      
      // If neither exists, redirect to login
      navigate('/');
      return false;
    } catch (error) {
      console.error('Authentication check error:', error);
      navigate('/');
      return false;
    }
  };

  // Permanently delete a cancelled appointment
  const deleteAppointmentPermanent = async (appointmentId) => {
    try {
      const deleteRes = await axios.delete(`http://localhost:8000/api/app/${appointmentId}`);
      if (deleteRes.data.msg === 'Success') {
        toast({
          title: 'Appointment Removed',
          description: 'Cancelled appointment removed from your records.',
          duration: 2000,
        });
        setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
      } else {
        toast({
          title: 'Delete failed',
          description: deleteRes.data.msg || 'Try again later',
          variant: 'destructive',
          duration: 2000,
        });
      }
    } catch (e) {
      console.error('Permanent delete error:', e);
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  const fetchPatientInfo = () => {
    try {
      // Try new authentication system first
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'patient') {
        setPatientInfo(user);
        return;
      }
      
      // Fallback to legacy patient system
      const patient = JSON.parse(localStorage.getItem('patient') || '{}');
      if (patient && (patient._id || patient.id)) {
        setPatientInfo({
          ...patient,
          role: 'patient',
          id: patient._id || patient.id
        });
      }
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patient = JSON.parse(localStorage.getItem('patient') || '{}');
      const patientId = (user && user.id) || (patient && (patient._id || patient.id));
      if (!patientId) {
        setAppointments([]);
        return;
      }
      
      console.log('Fetching appointments for patient ID:', patientId);
      const response = await axios.get(`http://localhost:8000/api/app/p/${patientId}`);

      console.log('Appointments response:', response.data);
      if (response.data.msg === "Success") {
        const appts = response.data.value || [];
        setAppointments(appts);
        // Enrich doctorName for legacy appointments lacking snapshot
        try {
          const missing = appts.filter(a => !a.doctorName && a.did && typeof a.did === 'string');
          const uniqueDids = [...new Set(missing.map(a => a.did))];
          if (uniqueDids.length > 0) {
            const idToName = {};
            await Promise.all(uniqueDids.map(async (id) => {
              try {
                const dr = await axios.get(`http://localhost:8000/api/doctor/${id}`);
                if (dr.data?.msg === 'Success' && dr.data?.value?.name) {
                  idToName[id] = dr.data.value.name;
                }
              } catch (e) {}
            }));
            if (Object.keys(idToName).length > 0) {
              setAppointments(prev => prev.map(a => (
                a.doctorName ? a : { ...a, doctorName: idToName[a.did] || a.doctorName }
              )));
            }
          }
        } catch (e) {
          console.warn('Doctor enrichment failed', e);
        }
      } else {
        console.log('No appointments found or API error');
        setAppointments([]);
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
    localStorage.removeItem('patient'); // Remove legacy patient data
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
      duration: 2000,
    });
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600 text-white border-green-700';
      case 'pending': return 'bg-yellow-500 text-yellow-900 border-yellow-300';
      case 'completed': return 'bg-blue-500 text-blue-900 border-blue-300';
      case 'cancelled': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-gray-400 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'completed': return '✔️';
      case 'cancelled': return '❌';
      default: return '❓';
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

  // Cancel appointment action for patient
  const cancelAppointment = async (appointmentId) => {
    try {
      // First try to delete the appointment from the database
      const deleteRes = await axios.delete(`http://localhost:8000/api/app/${appointmentId}`);
      if (deleteRes.data.msg === 'Success') {
        toast({
          title: 'Appointment Cancelled',
          description: 'Your appointment has been cancelled and removed.',
          duration: 2000,
        });
        // Remove the appointment from the UI
        setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
      } else {
        // If delete fails, try to update status to cancelled
        const updateRes = await axios.put(`http://localhost:8000/api/app/status/Cancelled/${appointmentId}`);
        if (updateRes.data.msg === 'Success') {
          toast({
            title: 'Appointment Cancelled',
            description: 'Your appointment has been cancelled.',
            duration: 2000,
          });
          // Remove from UI even if just status update
          setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
        } else {
          toast({ 
            title: 'Cancel failed', 
            description: updateRes.data.msg || 'Try again later', 
            variant: 'destructive', 
            duration: 2000 
          });
        }
      }
    } catch (e) {
      console.error('Cancel appointment error:', e);
      toast({ 
        title: 'Network error', 
        description: 'Please check your connection and try again.', 
        variant: 'destructive', 
        duration: 2000 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
        <div className="flex flex-col lg:flex-row">
          <PatientSidenav />
          
          <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-0 lg:pt-6 pb-4 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Compact Header */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-blue-100 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">My Appointments</h1>
                <p className="text-xs sm:text-base text-gray-600 truncate">Manage your healthcare appointments</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900 truncate">All Appointments</h2>
                <p className="text-xs sm:text-base text-gray-600">Total: {appointments.length} appointments</p>
              </div>
              <Button onClick={() => navigate('/patient/request-appointment')} size="sm" className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Book New Appointment</span>
                <span className="sm:hidden">Book</span>
              </Button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden mx-1 sm:mx-0">
            {appointments.length > 0 ? (
              <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={appointment._id} className="border rounded-lg p-2 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      {/* Left Section - Doctor Info */}
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="bg-blue-100 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                          <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                            {safe(appointment.doctorName || appointment.did?.name)}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {safe(appointment.specialty || appointment.did?.spe || 'Specialist')}
                          </p>
                          <p className="text-xs text-gray-600 truncate sm:hidden">
                            {appointment.date} • {appointment.slot}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section - Date & Description (Hidden on mobile) */}
                      <div className="hidden sm:block flex-1 min-w-0 px-4">
                        <div className="text-sm text-gray-900">{appointment.date}</div>
                        <div className="text-sm text-gray-500">{appointment.slot}</div>
                        <div className="text-xs text-gray-600 truncate max-w-xs">
                          {appointment.description}
                        </div>
                      </div>

                      {/* Right Section - Status & Actions */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(normalizeStatus(appointment.status))}`}>
                          <span className="mr-1">{getStatusIcon(normalizeStatus(appointment.status))}</span>
                          {normalizeStatus(appointment.status).charAt(0).toUpperCase() + normalizeStatus(appointment.status).slice(1)}
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-1 sm:space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 text-xs"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          {normalizeStatus(appointment.status) === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs"
                              onClick={() => navigate(`/patient/report/${appointment._id}`)}
                            >
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                          {normalizeStatus(appointment.status) === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs"
                              onClick={() => cancelAppointment(appointment._id)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                          {normalizeStatus(appointment.status) === 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs text-red-700 border-red-300 hover:bg-red-50"
                              onClick={() => deleteAppointmentPermanent(appointment._id)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 p-4">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">You haven't booked any appointments yet.</p>
                <Button onClick={() => navigate('/patient/request-appointment')} size="sm" className="text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Book Your First Appointment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Appointment Details Modal */}
      <AppointmentDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
  } catch (error) {
    console.error('PatientAppointments render error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Unable to load appointments page</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }
}

export default PatientAppointments;
