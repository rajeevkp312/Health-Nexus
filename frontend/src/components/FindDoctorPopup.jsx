import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Phone, MapPin, Award, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export function FindDoctorPopup({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedSpecialty, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/admin/doctors?t=${Date.now()}`);
      if (response.data && response.data.msg === "Success") {
        const list = response.data.value || response.data.doctors || [];
        const uniqueDoctors = Array.isArray(list)
          ? list.filter((doctor, index, self) => index === self.findIndex((d) => d.email === doctor.email))
          : [];
        setDoctors(uniqueDoctors);
        setFilteredDoctors(uniqueDoctors);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.qualification && doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(doctor =>
        doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const getUniqueSpecialties = () => {
    const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];
    return specialties.sort();
  };

  const isPatientAuthenticated = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'patient') return true;
      if (localStorage.getItem('patient')) return true; // legacy
    } catch {}
    return false;
  };

  const handleBookAppointment = (doctor) => {
    if (!isPatientAuthenticated()) {
      // Ask for login and then redirect to booking
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { redirectTo: '/patient/request-appointment' } }));
      onClose?.();
      return;
    }
    onClose?.();
    navigate('/patient/request-appointment');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-3 sm:p-4 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3 pr-8">
            <div className="bg-white/20 rounded-full p-2 sm:p-3 flex-shrink-0">
              <Search className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">Find a Doctor</h2>
              <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">Search and connect with our medical specialists</p>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Search by Name or Specialty
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Search doctors..."
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filter by Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
              >
                <option value="" className="text-black">All Specialties</option>
                {getUniqueSpecialties().map((specialty, index) => (
                  <option key={index} value={specialty} className="text-black">
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No doctors found</h3>
              <p className="text-sm sm:text-base text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id || doctor.email}
                  className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow"
                >
                  {/* Doctor Image */}
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                      {doctor.name ? doctor.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DR'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Doctor Info */}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
                        Dr. {doctor.name}
                      </h3>
                      
                      <div className="flex items-center mb-1 sm:mb-2">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-success truncate">
                          {doctor.qualification || doctor.qua || 'MD'}
                        </span>
                      </div>
                      
                      <p className="text-blue-600 font-semibold mb-1 sm:mb-2 text-sm sm:text-base truncate">
                        {doctor.specialty}
                      </p>
                      
                      <div className="flex items-center mb-1 sm:mb-2">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-800">
                          {doctor.experience || doctor.exp || '5+'} years experience
                        </span>
                        {(() => {
                          const r = Number(doctor.rating ?? doctor.avgRating ?? doctor.averageRating ?? doctor.ratingValue ?? doctor.ratingsAvg ?? doctor.ratings ?? doctor.stars);
                          return Number.isFinite(r) ? (
                            <span className="ml-2 text-xs sm:text-sm text-gray-800">{r.toFixed(1)}</span>
                          ) : null;
                        })()}
                      </div>

                      {doctor.phone && (
                        <div className="flex items-center mb-1 sm:mb-2">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-800 truncate">{doctor.phone}</span>
                        </div>
                      )}

                      {doctor.address && (
                        <div className="flex items-center mb-2 sm:mb-3">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-800 truncate">{doctor.address}</span>
                        </div>
                      )}

                      {/* Fee */}
                      <p className="text-xs sm:text-sm text-gray-800 mb-2">
                        Fee: ₹{doctor.consultationFee || '500'}
                      </p>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleBookAppointment(doctor)}
                        className="w-full !bg-green-500 !text-white hover:!bg-green-600 font-semibold py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                      >
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 ml-2"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
