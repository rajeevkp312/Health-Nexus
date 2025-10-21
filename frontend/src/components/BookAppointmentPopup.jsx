import React, { useState, useEffect } from 'react';
import { Calendar, X, User, Phone, Mail, Clock, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export function BookAppointmentPopup({ isOpen, onClose, defaultDoctorId, defaultDoctorName, onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      // Prefill from localStorage
      try {
        const patient = JSON.parse(localStorage.getItem('patient') || '{}');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData(prev => ({
          ...prev,
          patientName: patient?.name || user?.name || prev.patientName,
          phone: patient?.phone || user?.phone || prev.phone,
          email: patient?.email || user?.email || prev.email,
          doctorId: defaultDoctorId || prev.doctorId
        }));
      } catch {}
    }
  }, [isOpen, defaultDoctorId]);

  // When doctors list updates and defaultDoctorId is provided, ensure it's selected
  useEffect(() => {
    if (!isOpen) return;
    if (defaultDoctorId) {
      setFormData(prev => ({ ...prev, doctorId: defaultDoctorId }));
    }
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // cache-busting param to avoid stale data
      const response = await axios.get(`http://localhost:8000/api/admin/doctors?t=${Date.now()}`);
      if (response.data && response.data.msg === "Success") {
        const list = response.data.value || response.data.doctors || [];
        // De-duplicate by email (if any duplicates exist)
        const unique = Array.isArray(list)
          ? list.filter((doctor, idx, self) => idx === self.findIndex(d => d.email === doctor.email))
          : [];
        setDoctors(unique);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Resolve IDs and doctor info
      const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
      const userLS = JSON.parse(localStorage.getItem('user') || '{}');
      const pid = patientLS._id || patientLS.id || userLS.id || `guest:${formData.email || formData.phone || Date.now()}`;
      const selectedDoctor = doctors.find(d => (d._id === formData.doctorId));

      // Fetch complete patient profile data
      let patientProfile = null;
      if (pid && !pid.startsWith('guest:')) {
        try {
          const patientResp = await axios.get(`http://localhost:8000/api/patient/${pid}`);
          if (patientResp.data?.msg === 'Success' && patientResp.data?.value) {
            patientProfile = patientResp.data.value;
          }
        } catch (e) {
          console.warn('Could not fetch patient profile:', e);
        }
      }

      const payload = {
        pid,
        did: formData.doctorId,
        date: new Date(formData.appointmentDate),
        time: formData.appointmentTime,
        reason: formData.reason || 'General Consultation',
        // Basic denormalized fields
        patientName: formData.patientName,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        // Additional patient details from profile
        patientAge: patientProfile?.age,
        patientGender: patientProfile?.gender,
        patientBloodGroup: patientProfile?.bloodGroup,
        patientAddress: patientProfile?.address,
        // Doctor info
        doctorName: selectedDoctor?.name || defaultDoctorName || '',
        specialty: selectedDoctor?.specialty || selectedDoctor?.spe || ''
      };

      const res = await axios.post('http://localhost:8000/api/app', payload);
      if (res.data?.msg === 'Success') {
        alert(`Appointment booked!\nID: ${res.data.appointmentId}\nDoctor: ${selectedDoctor?.name || defaultDoctorName || ''}\nDate: ${formData.appointmentDate}\nTime: ${formData.appointmentTime}`);
        if (typeof onBooked === 'function') onBooked(res.data);
      } else {
        throw new Error(res.data?.msg || 'Booking failed');
      }

      // Reset form and close
      setFormData({
        patientName: '',
        phone: '',
        email: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
      });
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Book Appointment</h2>
              <p className="text-blue-100 text-sm">Schedule your visit with our specialists</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter patient's full name"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Enter phone number"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Enter email address (optional)"
              />
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="h-4 w-4 inline mr-1" />
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="" className="text-black">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id} className="text-black">
                    Dr. {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={minDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time *
                </label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="" className="text-black">Select time</option>
                  {Array.from({length: 24}).map((_, i) => (
                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`} className="text-black">
                      {i < 12 ? `${i.toString().padStart(2, '0')}:00 AM` : `${(i - 12).toString().padStart(2, '0')}:00 PM`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Brief description of your concern (optional)"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full !bg-green-500 !text-white hover:!bg-green-600 font-semibold py-3 rounded-xl mt-6"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </form>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl mt-3"
          >
            Cancel
          </Button>

          {/* Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Appointment confirmation will be sent via SMS/Call within 2 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
