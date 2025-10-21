import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Search, 
  Filter, 
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export function ModernViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Helper to get a consistent appointment ID across shapes
  const getAptId = (apt) => apt?._id || apt?.id || apt?.Id || apt?.ID;

  const statusOptions = ['All Status', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/appointments');
      if (response.data.msg === "Success") {
        const list = response.data.appointments || response.data.value || [];
        // Ensure each item has a stable id field for UI actions
        const normalized = Array.isArray(list)
          ? list.map((a) => ({ id: a?._id || a?.id, ...a }))
          : [];
        setAppointments(normalized);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Mock data for demo
      setAppointments([
        {
          id: 1,
          patientName: 'John Smith',
          patientEmail: 'john.smith@email.com',
          patientPhone: '+1 (555) 123-4567',
          doctorName: 'Dr. Sarah Wilson',
          specialty: 'Cardiology',
          date: '2024-01-25',
          time: '10:00 AM',
          status: 'Confirmed',
          reason: 'Regular checkup',
          notes: 'Patient has history of hypertension'
        },
        {
          id: 2,
          patientName: 'Emily Johnson',
          patientEmail: 'emily.j@email.com',
          patientPhone: '+1 (555) 987-6543',
          doctorName: 'Dr. Michael Brown',
          specialty: 'Neurology',
          date: '2024-01-26',
          time: '2:30 PM',
          status: 'Scheduled',
          reason: 'Headache consultation',
          notes: 'Recurring migraines'
        },
        {
          id: 3,
          patientName: 'Robert Davis',
          patientEmail: 'robert.d@email.com',
          patientPhone: '+1 (555) 456-7890',
          doctorName: 'Dr. Lisa Anderson',
          specialty: 'Orthopedics',
          date: '2024-01-24',
          time: '11:15 AM',
          status: 'Completed',
          reason: 'Knee pain',
          notes: 'Follow-up required in 2 weeks'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-600 text-white';
      case 'scheduled': return 'bg-blue-600 text-white';
      case 'completed': return 'bg-purple-600 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return CheckCircle;
      case 'scheduled': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    const base = 'http://localhost:8000';
    const id = appointmentId;
    const attempts = [
      async () => axios.put(`${base}/api/app/status/${newStatus}/${id}`),
      async () => axios.put(`${base}/api/admin/appointment/${id}`, { status: newStatus }),
      async () => axios.put(`${base}/api/app/${id}`, { status: newStatus }),
    ];

    let success = false;
    let lastErr = null;
    for (const fn of attempts) {
      try {
        const res = await fn();
        if (res?.data?.msg === 'Success') {
          success = true;
          break;
        }
      } catch (e) {
        lastErr = e;
      }
    }

    // Fallback: if cancelling and updates failed, try deleting
    if (!success && newStatus === 'Cancelled') {
      try {
        const del = await axios.delete(`${base}/api/app/${id}`);
        if (del?.data?.msg === 'Success') {
          setAppointments((prev) => prev.filter((a) => getAptId(a) !== id));
          alert('Appointment cancelled successfully!');
          return;
        }
      } catch (e) {
        lastErr = e;
      }
    }

    if (success) {
      setAppointments((prev) => prev.map((apt) => (
        getAptId(apt) === id ? { ...apt, status: newStatus } : apt
      )));
      alert(`Appointment ${newStatus.toLowerCase()} successfully!`);
    } else {
      console.error('Error updating appointment:', lastErr);
      alert('Error updating appointment. Please try again.');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || filterStatus === 'All Status' || 
                         appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-600 mt-1">Manage all patient appointments</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by patient name, doctor, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status === 'All Status' ? '' : status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-600 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'Confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'Scheduled').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Filter className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAppointments.map((appointment) => {
          const StatusIcon = getStatusIcon(appointment.status);
          return (
            <div key={getAptId(appointment) || appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                    <p className="text-sm text-gray-500">{appointment.reason}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {appointment.status}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center space-x-2 mb-3" style={{ color: '#000000', opacity: 1 }}>
                <Stethoscope className="h-4 w-4" style={{ color: '#4b5563' }} />
                <span className="text-sm text-black font-medium" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>{appointment.doctorName}</span>
                <span className="text-xs text-black font-medium" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>• {appointment.specialty}</span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center space-x-4 mb-4" style={{ color: '#000000', opacity: 1 }}>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" style={{ color: '#4b5563' }} />
                  <span className="text-sm text-black font-medium" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" style={{ color: '#4b5563' }} />
                  <span className="text-sm text-black font-medium" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>{appointment.time}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center space-x-2 text-xs text-gray-800">
                  <Mail className="h-3 w-3" />
                  <span>{appointment.patientEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-800">
                  <Phone className="h-3 w-3" />
                  <span>{appointment.patientPhone}</span>
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Notes:</p>
                  <p className="text-sm text-gray-700">{appointment.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAppointment(appointment)}
                  className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 text-white border-gray-900"
                  style={{ color: '#ffffff' }}
                >
                  <Eye className="h-3 w-3 text-white" style={{ color: '#ffffff' }} />
                  <span className="text-white" style={{ color: '#ffffff' }}>View Details</span>
                </Button>

                <div className="flex space-x-2">
                  {appointment.status === 'Scheduled' && (
                    <Button 
                      size="sm"
                      onClick={() => updateAppointmentStatus(getAptId(appointment), 'Confirmed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Confirm
                    </Button>
                  )}
                  {appointment.status === 'Confirmed' && (
                    <Button 
                      size="sm"
                      onClick={() => updateAppointmentStatus(getAptId(appointment), 'Completed')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Complete
                    </Button>
                  )}
                  {appointment.status === 'Scheduled' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateAppointmentStatus(getAptId(appointment), 'Cancelled')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus 
              ? 'Try adjusting your search or filter criteria'
              : 'No appointments scheduled at the moment'
            }
          </p>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <Button
                  onClick={() => setSelectedAppointment(null)}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-8 w-8 p-0 flex items-center justify-center"
                  aria-label="Close"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Patient Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-800">
                    <div><span className="font-medium text-gray-900">Name:</span> {selectedAppointment.patientName}</div>
                    <div><span className="font-medium text-gray-900">Email:</span> {selectedAppointment.patientEmail}</div>
                    <div><span className="font-medium text-gray-900">Phone:</span> {selectedAppointment.patientPhone}</div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Doctor Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-800">
                    <div><span className="font-medium text-gray-900">Doctor:</span> {selectedAppointment.doctorName}</div>
                    <div><span className="font-medium text-gray-900">Specialty:</span> {selectedAppointment.specialty}</div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-800">
                    <div><span className="font-medium text-gray-900">Date:</span> {new Date(selectedAppointment.date).toLocaleDateString()}</div>
                    <div><span className="font-medium text-gray-900">Time:</span> {selectedAppointment.time}</div>
                    <div><span className="font-medium text-gray-900">Reason:</span> {selectedAppointment.reason}</div>
                    <div>
                      <span className="font-medium text-gray-900">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                    {selectedAppointment.notes && (
                      <div><span className="font-medium text-gray-900">Notes:</span> {selectedAppointment.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernViewAppointments;
