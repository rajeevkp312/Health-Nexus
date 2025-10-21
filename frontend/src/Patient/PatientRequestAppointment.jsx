import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Stethoscope,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import PatientSidenav from './PatientSidenav';

export function PatientRequestAppointment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientInfo, setPatientInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    slot: '',
    description: ''
  });

  const specialties = [
    'Cardiology',
    'Neurology',
    'Neurosurgery', 
    'Orthopedics',
    'Dermatology',
    'Pediatrics',
    'Gynecology',
    'Psychiatry',
    'Oncology',
    'Radiology',
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery'
  ];

  // Specialty aliases for flexible matching
  const specialtyAliases = {
    'Neurology': ['Neurology', 'Neurosurgery', 'Neuro Surgeon', 'Neuro Surgery'],
    'Neurosurgery': ['Neurosurgery', 'Neurology', 'Neuro Surgeon', 'Neuro Surgery'],
    'Cardiology': ['Cardiology', 'Cardiac Surgery', 'Heart Surgery'],
    'Orthopedics': ['Orthopedics', 'Orthopaedics', 'Bone Surgery'],
    'Surgery': ['Surgery', 'General Surgery', 'Surgical']
  };

  const timeSlots = [
    { value: 'Morning', label: 'Morning (9:00 AM - 12:00 PM)' },
    { value: 'Afternoon', label: 'Afternoon (1:00 PM - 4:00 PM)' },
    { value: 'Evening', label: 'Evening (4:00 PM - 8:00 PM)' }
  ];

  useEffect(() => {
    checkAuthentication();
    fetchPatientInfo();
    fetchDoctors();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const patient = localStorage.getItem('patient');
    
    console.log('Auth check - token:', !!token, 'user:', !!user, 'patient:', !!patient);
    
    // Allow access if user exists (new system) or patient exists (old system)
    if (!user && !patient) {
      console.log('No user or patient found, redirecting to home');
      navigate('/');
      return;
    }

    // If user exists, check role
    if (user) {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
      if (userData.role && userData.role !== 'patient') {
        console.log('User role is not patient, redirecting');
        navigate('/');
        return;
      }
    }
    
    console.log('Authentication passed');
  };

  const fetchPatientInfo = () => {
    const user = localStorage.getItem('user');
    const patient = localStorage.getItem('patient');
    
    console.log('Fetching patient info - user:', !!user, 'patient:', !!patient);
    
    if (user) {
      const userData = JSON.parse(user);
      console.log('Setting patient info from user:', userData);
      setPatientInfo(userData);
    } else if (patient) {
      const patientData = JSON.parse(patient);
      console.log('Setting patient info from patient:', patientData);
      setPatientInfo(patientData);
    }
  };

  const fetchDoctors = async () => {
    console.log('Fetching doctors...');
    try {
      const response = await axios.get('http://localhost:8000/api/doctor');
      console.log('Doctors API response:', response.data);
      if (response.data.msg === "Success") {
        setDoctors(response.data.value);
        setFilteredDoctors(response.data.value);
        console.log('Doctors loaded successfully:', response.data.value.length);
      } else {
        console.log('API returned non-success message');
        setDoctors([]);
        setFilteredDoctors([]);
        // Inform user
        toast({ title: 'Unable to load doctors', description: 'Please try again later.', variant: 'destructive', duration: 2000 });
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
      toast({ title: 'Network error', description: 'Failed to fetch doctors.', variant: 'destructive', duration: 2000 });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData({ ...formData, specialty, doctorId: '' });
    
    if (specialty) {
      // Get aliases for the selected specialty
      const aliases = specialtyAliases[specialty] || [specialty];
      
      const filtered = doctors.filter(doctor => {
        const doctorSpecialty = doctor.spe || doctor.specialty || '';
        
        // Check if doctor's specialty matches any alias (case-insensitive)
        return aliases.some(alias => 
          doctorSpecialty.toLowerCase().includes(alias.toLowerCase()) ||
          alias.toLowerCase().includes(doctorSpecialty.toLowerCase())
        );
      });
      
      console.log(`Filtering for specialty: ${specialty}`);
      console.log(`Aliases: ${aliases.join(', ')}`);
      console.log(`Found ${filtered.length} doctors:`, filtered.map(d => ({ name: d.name, specialty: d.spe || d.specialty })));
      
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const patient = JSON.parse(localStorage.getItem('patient') || '{}');
      const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
      
      const appointmentData = {
        pid: patient._id || user.id,
        did: formData.doctorId,
        date: formData.date,
        time: formData.slot, // Map slot to time field
        slot: formData.slot,
        reason: formData.description || 'General Consultation',
        description: formData.description,
        patientName: user.name || patient.name,
        patientEmail: user.email || patient.email,
        patientPhone: user.phone || patient.phone,
        // Add doctor snapshot to avoid N/A issues without populate
        doctorName: selectedDoctor?.name,
        specialty: selectedDoctor?.spe || selectedDoctor?.specialty
      };

      console.log('Submitting appointment data:', appointmentData);
      const response = await axios.post('http://localhost:8000/api/app', appointmentData);
      console.log('Appointment response:', response.data);
      
      if (response.data.msg === "Success") {
        toast({
          title: "Appointment Requested! ✅",
          description: "Your appointment request has been sent to the doctor. You'll be notified once it's confirmed.",
          duration: 2000,
        });
        
        // Reset form
        setFormData({
          specialty: '',
          doctorId: '',
          date: '',
          slot: '',
          description: ''
        });
        
        // Navigate to appointments page
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 1500);
      } else {
        toast({
          title: "Request Failed",
          description: response.data.msg || "Something went wrong. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      
      let errorMessage = "Network error. Please check your connection and try again.";
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
        if (error.response.data.errors) {
          errorMessage += ": " + error.response.data.errors.join(", ");
        }
      }
      
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  console.log('Component render - loading:', loading, 'patientInfo:', patientInfo, 'doctors:', doctors.length);

  if (loading) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">Book Appointment</h1>
                <p className="text-xs sm:text-base text-gray-600 truncate">Schedule your healthcare consultation</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Request New Appointment</h2>
              <p className="text-gray-600">Fill in the details below to book your appointment with our healthcare professionals.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Specialty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Specialty *
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleSpecialtyChange(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">-- Select Specialty --</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor *
                </label>
                <div className="space-y-3">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                          formData.doctorId === doctor._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('doctorId', doctor._id)}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-4">
                          <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                            <Stethoscope className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{doctor.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{doctor.spe || doctor.specialty}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center space-x-1 min-w-0">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{doctor.email}</span>
                              </div>
                              <div className="flex items-center space-x-1 min-w-0">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{doctor.phone}</span>
                              </div>
                            </div>
                          </div>
                          {formData.doctorId === doctor._id && (
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {formData.specialty ? 'No doctors available for this specialty' : 'Please select a specialty first'}
                    </p>
                  )}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time Slot *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.value}
                      className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                        formData.slot === slot.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('slot', slot.value)}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{slot.value}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{slot.label.split('(')[1].replace(')', '')}</p>
                        </div>
                        {formData.slot === slot.value && (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Problem *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="Please describe your symptoms or reason for consultation..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patient/appointments')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Request Appointment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientRequestAppointment;
