import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Activity,
  MoreVertical,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ModernViewPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const statusOptions = ['All Status', 'Active', 'Inactive', 'Critical', 'Recovered'];

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/patients');
      if (response.data.msg === "Success") {
        // Backend returns list in `value`
        setPatients(response.data.value || response.data.patients || []);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const impersonatePatient = (patient) => {
    try {
      const admin = localStorage.getItem('admin') || '';
      localStorage.setItem('impersonatedByAdmin', 'true');
      localStorage.setItem('impersonateRole', 'patient');
      localStorage.setItem('impersonateBy', admin);
      const userObj = {
        id: patient._id || patient.id,
        name: patient.name,
        email: patient.email,
        role: 'patient'
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('patient', JSON.stringify(patient));
      localStorage.setItem('token', 'admin-impersonation');
      navigate('/patient');
    } catch (e) {
      console.error('Impersonation failed:', e);
      alert('Failed to impersonate patient');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await axios.delete(`http://localhost:8000/api/admin/patient/${patientId}`);
        if (response.data.msg === "Success") {
          setPatients(patients.filter(patient => (patient._id || patient.id) !== patientId));
          alert('Patient deleted successfully!');
        } else {
          alert('Error deleting patient: ' + (response.data.error || response.data.msg));
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'recovered': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Normalize helper for flexible, case-insensitive comparisons
  const normalize = (s) => String(s || '')
    .toLowerCase()
    .trim();

  const filteredPatients = patients.filter(patient => {
    const q = normalize(searchTerm);
    const noQuery = q.length === 0;

    const haystack = [
      patient.name,
      patient.email,
      patient.phone,
      patient.condition,
      patient.address,
      patient.gender,
      patient.bloodGroup,
    ]
      .map(normalize)
      .join(' ');

    const matchesSearch = noQuery || haystack.includes(q);

    const statusFilter = normalize(filterStatus);
    const pStatus = normalize(patient.status);
    const matchesStatus = !statusFilter || filterStatus === 'All Status' || pStatus === statusFilter;

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
    <div className="space-y-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-1">Manage all patients in the HealthNexus system</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/dash/adpatient')}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search patients by name, email, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {patients.filter(p => p.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Critical Patients</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {patients.filter(p => p.status === 'Critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{filteredPatients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-900 text-sm">Patient</th>
                <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-900 text-sm">Contact</th>
                <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-900 text-sm">Details</th>
                <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-900 text-sm">Status</th>
                <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-900 text-sm">Last Visit</th>
                <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient._id || patient.id} className="hover:bg-gray-50">
                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{patient.name}</div>
                        <div className="text-xs sm:text-sm text-secondary">
                          {patient.age} years • {patient.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="text-xs sm:text-sm">
                      <div className="flex items-center text-secondary mb-1">
                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-center text-secondary">
                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{patient.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="text-xs sm:text-sm">
                      <div className="text-gray-900 font-medium truncate">{patient.condition}</div>
                      <div className="text-secondary">Blood: {patient.bloodGroup}</div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="text-xs sm:text-sm text-secondary">
                      {new Date(patient.lastVisit).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                        className="p-1 sm:p-2 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/dash/editpatient/${patient._id || patient.id}`)}
                        className="p-1 sm:p-2 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="p-1 sm:p-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        onClick={() => impersonatePatient(patient)}
                        title="Impersonate as this patient"
                      >
                        <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="p-1 sm:p-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        onClick={() => handleDeletePatient(patient._id || patient.id)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first patient'
            }
          </p>
          <Button 
            onClick={() => navigate('/admin/dash/adpatient')}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Patient
          </Button>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                <Button 
                  variant="ghost" 
                  className="bg-danger"
                  onClick={() => setSelectedPatient(null)}
                >
                  X
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                  <p className="text-secondary">{selectedPatient.age} years old • {selectedPatient.gender}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-secondary">{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-secondary">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-secondary">{selectedPatient.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Blood Group:</span> {selectedPatient.bloodGroup}
                      </div>
                      <div>
                        <span className="font-medium">Condition:</span> {selectedPatient.condition}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPatient.status)}`}>
                          {selectedPatient.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Last Visit:</span> {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                      </div>
                    </div>
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

export default ModernViewPatients;
