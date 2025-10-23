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
  Star,
  Users,
  Calendar,
  MoreVertical,
  LogIn,
  X,
  IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../setupApiBase';

export function ModernViewDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const specialties = [
    'All Specialties', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Dermatology', 'Psychiatry', 'Oncology', 'Radiology'
  ];

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/doctors');
      if (response.data.msg === "Success") {
        setDoctors(response.data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const impersonateDoctor = (doctor) => {
    try {
      const admin = localStorage.getItem('admin') || '';
      localStorage.setItem('impersonatedByAdmin', 'true');
      localStorage.setItem('impersonateRole', 'doctor');
      localStorage.setItem('impersonateBy', admin);
      const userObj = {
        id: doctor._id || doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor'
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('doctor', JSON.stringify(doctor));
      localStorage.setItem('token', 'admin-impersonation');
      // Go to doctor portal
      navigate('/doctor');
    } catch (e) {
      console.error('Impersonation failed:', e);
      alert('Failed to impersonate doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/doctor/${doctorId}`);
        setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
        alert('Doctor deleted successfully');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Error deleting doctor');
      }
    }
  };

  // Normalize specialties for flexible matching (handles 'Neurology', 'Neuro Surgeon', 'Neurosurgery', etc.)
  const normalize = (s) => String(s || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '') // remove spaces/dashes
    .replace(/(ologist|ology|surgeon|surgery)$/,'') // strip common suffixes
    .trim();

  const filteredDoctors = doctors.filter(doctor => {
    const name = String(doctor.name || '');
    const specRaw = doctor.specialty || doctor.spe || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(specRaw).toLowerCase().includes(searchTerm.toLowerCase());

    const filterSpecNorm = normalize(filterSpecialty);
    const docSpecNorm = normalize(specRaw);
    const noFilter = !filterSpecNorm || filterSpecialty === 'All Specialties';
    const matchesSpecialty = noFilter || docSpecNorm === filterSpecNorm ||
                             docSpecNorm.includes(filterSpecNorm) || filterSpecNorm.includes(docSpecNorm);

    return matchesSearch && matchesSpecialty;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-gray-600 mt-1">Manage your medical staff and their information</p>
        </div>
        <Button
          onClick={() => navigate('/admin/dash/addoc')}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Doctor
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
                placeholder="Search doctors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty === 'All Specialties' ? '' : specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor, index) => (
          <div
            key={doctor._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Doctor Header */}
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-teal-500">
              {/* Doctor photo covering header (falls back to initials gradient if missing) */}
              <img
                src={(() => {
                  try {
                    const raw = String(doctor.image || doctor.profilePhoto || '').trim();
                    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=4f46e5&color=fff&bold=true`;
                    if (!raw) return fallback;
                    if (/^https?:\/\//i.test(raw)) return raw; // absolute URL
                    if (raw.startsWith('data:image/')) return raw; // base64
                    return getImageUrl(raw) || fallback;
                  } catch {
                    return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=4f46e5&color=fff&bold=true`;
                  }
                })()}
                alt={doctor.name}
                className="absolute inset-0 w-full h-full object-contain bg-white"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = '1';
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=0ea5e9&color=fff&bold=true`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-gray-800 font-medium">{doctor.specialty}</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-800 ml-1" style={{color:'#374151'}}>
                    {(() => {
                      const r = Number(doctor.rating ?? doctor.avgRating ?? doctor.averageRating ?? doctor.ratingValue ?? doctor.ratingsAvg ?? doctor.ratings ?? doctor.stars);
                      return Number.isFinite(r) ? r.toFixed(1) : '—';
                    })()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{doctor.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{doctor.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{doctor.address || 'HealthNexus Medical Center'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">Experience: {(() => {
                    const v = doctor.experience ?? doctor.exp ?? doctor.yearsOfExperience;
                    if (v === undefined || v === null || String(v).trim() === '') return '5+ years';
                    const s = String(v).trim();
                    return /^\d+(\+)?$/.test(s) ? `${s} years` : s;
                  })()}</span>
                </div>
                <div className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">Consultation Fee: {(() => {
                    const v = doctor.consultationFee ?? doctor.fee ?? doctor.charges;
                    const fallback = '150';
                    const s = String((v === undefined || v === null || String(v).trim() === '') ? fallback : v).trim();
                    return s.startsWith('₹') ? s : `₹${s}`;
                  })()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                {/* Row 1: View, Edit */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="truncate">View</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg"
                  onClick={() => navigate(`/admin/dash/editdoc/${doctor._id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span className="truncate">Edit</span>
                </Button>
                {/* Row 2: Impersonate, Delete */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg"
                  onClick={() => impersonateDoctor(doctor)}
                  title="Impersonate as this doctor"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Impersonate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg"
                  onClick={() => handleDeleteDoctor(doctor._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterSpecialty 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first doctor'
            }
          </p>
          <Button 
            onClick={() => navigate('/admin/dash/addoc')}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Doctor
          </Button>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6" style={{ color: '#111827', opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDoctor(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-gray-900">{selectedDoctor.specialty}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Email:</span>
                    <p className="text-gray-900">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Phone:</span>
                    <p className="text-gray-900">{selectedDoctor.phone}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Experience:</span>
                    <p className="font-bold text-gray-900 bg-white px-2 py-1 rounded">
                      {selectedDoctor.experience || selectedDoctor.exp || selectedDoctor.yearsOfExperience || '5+'} years
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Fee:</span>
                    <p className="text-gray-900">₹{selectedDoctor.consultationFee || '150'}</p>
                  </div>
                </div>
                
                {selectedDoctor.bio && (
                  <div>
                    <span className="font-medium text-gray-900">Bio:</span>
                    <p className="text-gray-900 mt-1">{selectedDoctor.bio}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedDoctor(null);
                    navigate(`/admin/dash/editdoc/${selectedDoctor._id}`);
                  }}
                  className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white border-gray-900"
                  style={{ color: '#ffffff' }}
                >
                  <Edit className="h-4 w-4 text-white" style={{ color: '#ffffff' }} />
                  <span className="text-white" style={{ color: '#ffffff' }}>Edit Doctor</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this doctor?')) {
                      handleDeleteDoctor(selectedDoctor._id);
                      setSelectedDoctor(null);
                    }
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Doctor</span>
                </Button>
                <Button 
                  onClick={() => setSelectedDoctor(null)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernViewDoctors;
