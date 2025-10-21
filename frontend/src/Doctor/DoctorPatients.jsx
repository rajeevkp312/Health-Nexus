import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';
import { useToast } from '@/hooks/use-toast';
import { Users, User, Mail, Phone, MapPin, Stethoscope, Calendar, Search, Trash2 } from 'lucide-react';

function DoctorPatients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    checkAuthentication();
    fetchDoctorInfo();
    fetchDoctorPatients();
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
    const doctor = localStorage.getItem('doctor');
    if (user) setDoctorInfo(JSON.parse(user));
    else if (doctor) setDoctorInfo(JSON.parse(doctor));
  };

  const resolveDoctorId = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorLS = JSON.parse(localStorage.getItem('doctor') || '{}');
    let doctorId = doctorLS._id || user.id;
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

  const debugDoctorData = async () => {
    try {
      const doctorId = await resolveDoctorId();
      const resp = await axios.get(`http://localhost:8000/api/patient/debug/doctor/${doctorId}`);
      console.log('=== DEBUG DATA ===');
      console.log('Debug Response:', JSON.stringify(resp.data, null, 2));
      console.log('==================');
    } catch (e) {
      console.error('Debug error:', e);
    }
  };

  const fetchDoctorPatients = async () => {
    setLoading(true);
    try {
      const doctorId = await resolveDoctorId();
      console.log('Doctor ID:', doctorId);
      
      // Use the new endpoint that gets all patients for a doctor
      const resp = await axios.get(`http://localhost:8000/api/patient/doctor/${doctorId}`);
      console.log('API Response:', resp.data);
      console.log('Full API Response JSON:', JSON.stringify(resp.data, null, 2));

      if (resp.data?.msg === 'Success') {
        console.log('Patients found:', resp.data.value?.length || 0);
        console.log('Patient details:', resp.data.value);
        resp.data.value?.forEach((patient, index) => {
          console.log(`Patient ${index + 1}:`, patient.name, 'ID:', patient._id);
        });
        setPatients(resp.data.value || []);
      } else {
        console.log('No patients found or API error:', resp.data);
        setPatients([]);
      }
    } catch (e) {
      console.error('Error fetching doctor patients:', e);
      toast({ title: 'Failed to load patients', description: 'Please try again later.', variant: 'destructive', duration: 2000 });
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get field values
  const getFieldValue = (patient, field, fallback = 'N/A') => {
    const value = patient[field];
    return value && value !== 'N/A' && value !== null && value !== undefined ? value : fallback;
  };

  // Helper function to format date properly
  const formatDate = (dateValue) => {
    if (!dateValue || dateValue === 'N/A') return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch (e) {
      return 'N/A';
    }
  };

  const formatAge = (val) => {
    if (val === null || val === undefined || val === 'N/A') return 'N/A';
    const s = String(val).trim();
    if (!s) return 'N/A';
    return /^\d+$/.test(s) ? `${s} years` : s;
  };

  const formatGender = (val) => {
    if (val === null || val === undefined || val === 'N/A') return 'N/A';
    const s = String(val).trim();
    if (!s) return 'N/A';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const handleDeletePatient = async (patientId, patientName) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete patient "${patientName}"?\n\nThis action cannot be undone and will permanently remove all patient data.`
    );
    
    if (!confirmed) return;

    try {
      const response = await axios.delete(`http://localhost:8000/api/patient/${patientId}`);
      
      if (response.data.msg === 'Success') {
        // Remove patient from local state
        setPatients(prevPatients => prevPatients.filter(p => p._id !== patientId));
        
        toast({
          title: 'Patient Deleted',
          description: `${patientName} has been successfully removed from the system.`,
          variant: 'default',
          duration: 2000
        });
      } else {
        throw new Error(response.data.msg || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      
      let errorMessage = 'Failed to delete patient. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Patient not found. They may have already been deleted.';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 2000
      });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      getFieldValue(p, 'name', '').toLowerCase().includes(q) ||
      getFieldValue(p, 'email', '').toLowerCase().includes(q) ||
      (getFieldValue(p, 'phone', '') || getFieldValue(p, 'number', '')).toLowerCase().includes(q) ||
      (getFieldValue(p, 'bloodGroup', '') || getFieldValue(p, 'bloodgrp', '')).toLowerCase().includes(q) ||
      getFieldValue(p, 'gender', '').toLowerCase().includes(q) ||
      String(getFieldValue(p, 'age', '')).includes(q)
    );
  }, [patients, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />

        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-blue-100 rounded-full p-1.5 sm:p-3">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-base sm:text-2xl font-bold text-gray-900">My Patients</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Total: {patients.length}</p>
                </div>
              </div>
              <button 
                onClick={debugDoctorData}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Debug Data
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by name, email, phone, blood group"
                />
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mx-1 sm:mx-0">
            {filtered.length ? (
              filtered.map((p) => (
                <div key={p._id} className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-50 rounded-full p-2">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{getFieldValue(p, 'name', 'Unknown Patient')}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{getFieldValue(p, 'status', 'Active')}</span>
                          <button
                            onClick={() => handleDeletePatient(p._id, getFieldValue(p, 'name', 'Unknown Patient'))}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">ID: {p._id}</p>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate text-gray-800">{getFieldValue(p, 'email')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="truncate text-gray-800">{getFieldValue(p, 'phone') || getFieldValue(p, 'number')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="truncate text-gray-800">
                            {formatAge(getFieldValue(p, 'age'))} • {formatGender(getFieldValue(p, 'gender'))} • {getFieldValue(p, 'bloodGroup') || getFieldValue(p, 'bloodgrp')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate text-gray-800">{getFieldValue(p, 'address')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="truncate text-gray-800">Last Visit: {formatDate(p.lastVisit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow-sm border p-8 text-center">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No patients found for you yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPatients;
