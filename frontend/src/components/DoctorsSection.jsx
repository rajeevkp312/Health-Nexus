import React, { useState, useEffect } from 'react';
import { Calendar, Award, Clock, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { BookAppointmentPopup } from './BookAppointmentPopup';

export function DoctorsSection() {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const isPatientAuthenticated = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'patient') return true;
      if (localStorage.getItem('patient')) return true; // legacy support
    } catch {}
    return false;
  };

  const handleBookClick = (doctor) => {
    if (!isPatientAuthenticated()) {
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { redirectTo: '/patient/request-appointment' } }));
      return;
    }
    setSelectedDoctor(doctor);
    setIsBookOpen(true);
  };

  const fetchDoctors = async () => {
    try {
      // Add cache busting to ensure fresh data
      const response = await axios.get(`http://localhost:8000/api/admin/doctors?t=${Date.now()}`);
      if (response.data.msg === "Success") {
        // Fix: API returns data in 'value' field, not 'doctors'
        const doctorsData = response.data.value || response.data.doctors || [];
        // Deduplicate by email, BUT prefer the entry that has an image
        const byEmail = new Map();
        doctorsData.forEach((doc) => {
          const key = doc.email || doc._id || Math.random().toString(36);
          const existing = byEmail.get(key);
          if (!existing) {
            byEmail.set(key, doc);
          } else {
            const hasImgExisting = !!existing.image;
            const hasImgNew = !!doc.image;
            if (!hasImgExisting && hasImgNew) {
              byEmail.set(key, doc);
            } else if (hasImgExisting === hasImgNew) {
              // Prefer the most recently updated if timestamps exist
              const t1 = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
              const t2 = new Date(doc.updatedAt || doc.createdAt || 0).getTime();
              if (t2 > t1) byEmail.set(key, doc);
            }
          }
        });
        let uniqueDoctors = Array.from(byEmail.values());

        // Patch in localStorage doctor photo immediately (helps when DB image isn't saved yet)
        try {
          const lsDoctor = JSON.parse(localStorage.getItem('doctor') || '{}');
          const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
          const lsEmail = lsDoctor?.email || lsUser?.email;
          const lsPhoto = lsDoctor?.image || lsDoctor?.profilePhoto || lsUser?.profilePhoto || lsUser?.image;
          if (lsEmail && lsPhoto) {
            uniqueDoctors = uniqueDoctors.map(d => (
              d.email === lsEmail ? { ...d, image: lsPhoto } : d
            ));
          }
        } catch (e) {
          console.warn('LocalStorage doctor photo patch skipped:', e);
        }
        
        // Debug: Log image data for each doctor
        uniqueDoctors.forEach(doctor => {
          if (doctor.image) {
            console.log(`Doctor ${doctor.name} - Image:`, 
              doctor.image.startsWith('data:image/') ? 'Base64 Image' : 'File Path: ' + doctor.image
            );
          } else {
            console.log(`Doctor ${doctor.name} - No Image`);
          }
        });
        
        setAllDoctors(uniqueDoctors); // Store all doctors
        setDoctors(uniqueDoctors.slice(0, 4)); // Show only first 4 doctors
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to empty array if API fails
      setDoctors([]);
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [refreshKey]);

  // Listen for storage changes to refresh doctors when profile is updated
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Listen for custom event when doctor profile is updated
    window.addEventListener('doctorProfileUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('doctorProfileUpdated', handleStorageChange);
    };
  }, []);

  return (
    <section id="doctors" className="py-8 bg-sky-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">
              Meet Our Specialists
            </h2>
            <Button
              onClick={() => {
                setLoading(true);
                fetchDoctors();
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our world-class team of medical professionals is dedicated to providing 
            exceptional care with expertise and compassion.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {doctors.map((doctor, index) => (
              <div
                key={doctor._id || doctor.email}
                className="card-doctor group"
                style={{ animationDelay: `${index * 0.1}s`  }}
              >
                {/* Doctor Image */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 to-teal-500">
                  <img
                    src={(() => {
                      try {
                        const rawSrc = (doctor.image || doctor.profilePhoto || doctor.avatar || doctor.photo || '').toString().trim();
                        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=4f46e5&color=fff&bold=true`;
                        if (!rawSrc) return fallback;
                        if (/^https?:\/\//i.test(rawSrc)) return rawSrc; // Absolute URL
                        if (rawSrc.startsWith('data:image/')) return rawSrc; // Base64
                        const parts = rawSrc.split(/[\\/]+/);
                        const filename = parts[parts.length - 1];
                        if (!filename) return fallback;
                        return `http://localhost:8000/uploads/${filename}`;
                      } catch (error) {
                        console.error('Error constructing image URL:', error);
                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=4f46e5&color=fff&bold=true`;
                      }
                    })()}
                    alt={doctor.name}
                    className="w-full h-48 object-contain bg-white group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      console.log('Doctor image data:', doctor.image || doctor.profilePhoto);
                      if (!e.target.dataset.fallbackAttempted) {
                        e.target.dataset.fallbackAttempted = 'true';
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=300&background=0ea5e9&color=fff&bold=true`;
                      } else if (!e.target.dataset.secondFallback) {
                        e.target.dataset.secondFallback = 'true';
                        e.target.src = `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=400&fit=crop&crop=face`;
                      } else {
                        e.target.style.display = 'none';
                        const initialsDiv = e.target.nextElementSibling;
                        if (initialsDiv && initialsDiv.classList.contains('doctor-initials')) {
                          initialsDiv.style.display = 'flex';
                        }
                      }
                    }}
                  />
                  {/* Initials fallback */}
                  <div className="doctor-initials absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold" style={{display: 'none'}}>
                    {doctor.name ? doctor.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DR'}
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-black border border-gray-200">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {doctor.availableTime || 'Available Today'}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {doctor.name}
                  </h3>
                  <div className="flex items-center mb-1">
                    <Award className="h-3 w-3 text-primary mr-1" />
                    <span className="text-xs text-muted-foreground">
                      {doctor.qualification || doctor.qua || 'MD'}
                    </span>
                  </div>
                  <p className="text-primary font-semibold mb-1 text-sm">
                    {doctor.specialty}
                  </p>
                  <p className="text-xs text-gray-800 mb-3 font-semibold">
                    <span className="text-gray-800 font-bold text-sm">{doctor.experience || doctor.exp || '5+'} years</span> of Experience
                  </p>

                  <Button
                    onClick={() => handleBookClick(doctor)}
                    className="w-full !bg-green-500 !text-white hover:!bg-white hover:!text-green-500 font-semibold py-3 rounded-xl border-2 !border-green-500 hover:!border-green-500 transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More Doctors Button */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={() => setShowAllDoctors(true)}
            className="!bg-green-500 !text-white hover:!bg-white hover:!text-green-500 font-semibold px-8 py-3 rounded-xl border-2 !border-green-500 hover:!border-green-500 transition-all duration-200"
          >
            View All Doctors ({allDoctors.length})
          </Button>
        </div>
      </div>

      {/* All Doctors Modal */}
      {showAllDoctors && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Our Doctors ({allDoctors.length})</h2>
              <button
                onClick={() => setShowAllDoctors(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allDoctors.map((doctor, index) => (
                  <div
                    key={doctor._id || doctor.email}
                    className="card-doctor group"
                  >
                    {/* Doctor Image */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 to-teal-500">
                      <img
                        src={(() => {
                          try {
                            const rawSrc = (doctor.image || doctor.profilePhoto || doctor.avatar || doctor.photo || '').toString().trim();
                            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=4f46e5&color=fff&bold=true`;
                            if (!rawSrc) return fallback;
                            if (/^https?:\/\//i.test(rawSrc)) return rawSrc; // Absolute URL
                            if (rawSrc.startsWith('data:image/')) return rawSrc; // Base64
                            const parts = rawSrc.split(/[\\/]+/);
                            const filename = parts[parts.length - 1];
                            if (!filename) return fallback;
                            return `http://localhost:8000/uploads/${filename}`;
                          } catch (error) {
                            console.error('Error constructing modal image URL:', error);
                            return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=4f46e5&color=fff&bold=true`;
                          }
                        })()}
                        alt={doctor.name}
                        className="w-full h-48 object-contain bg-white group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.log('Modal Image failed to load:', e.target.src);
                          console.log('Modal Doctor image data:', doctor.image || doctor.profilePhoto);
                          if (!e.target.dataset.fallbackAttempted) {
                            e.target.dataset.fallbackAttempted = 'true';
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=300&background=0ea5e9&color=fff&bold=true`;
                          }
                        }}
                      />
                      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-black border border-gray-200">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {doctor.availableTime || 'Available Today'}
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center mb-1">
                        <Award className="h-3 w-3 text-primary mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {doctor.qualification || doctor.qua || 'MD'}
                        </span>
                      </div>
                      <p className="text-primary font-semibold mb-1 text-sm">
                        {doctor.specialty}
                      </p>
                      <p className="text-xs text-gray-800 mb-3 font-semibold">
                        <span className="text-gray-800 font-bold text-sm">{doctor.experience || doctor.exp || '5+'} years</span> of Experience
                      </p>
                      <p className="text-xs text-gray-800 mb-3">
                        Fee: ₹{doctor.consultationFee || '500'}
                      </p>

                      <Button
                        onClick={() => handleBookClick(doctor)}
                        className="w-full !bg-green-500 !text-white hover:!bg-white hover:!text-green-500 font-semibold py-3 rounded-xl border-2 !border-green-500 hover:!border-green-500 transition-all duration-200"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Book Appointment Popup */}
      <BookAppointmentPopup
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        defaultDoctorId={selectedDoctor?._id}
        defaultDoctorName={selectedDoctor?.name}
        onBooked={() => setIsBookOpen(false)}
      />
    </section>
  );
}
