import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Stethoscope, 
  Calendar,
  Upload,
  Save,
  ArrowLeft,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ModernAddDoctor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    number: '',
    specialty: '',
    experience: '',
    qualification: '',
    address: '',
    consultationFee: '',
    availableDays: [],
    availableTime: '',
    bio: '',
    password: '',
    image: null
  });

  const specialties = [
    'Cardiology', 'Neurology', 'Neurosurgery', 'Orthopedics', 'Pediatrics', 
    'Dermatology', 'Psychiatry', 'Oncology', 'Radiology',
    'Emergency Medicine', 'Internal Medicine', 'Surgery', 'Gynecology'
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    console.log('File selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form data before submission:', formData);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'availableDays') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'number') {
          // Only add number if it has a value to avoid unique constraint issues
          if (formData[key] && formData[key].trim() !== '') {
            formDataToSend.append(key, formData[key]);
            console.log(`Added to FormData: ${key} =`, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
          console.log(`Added to FormData: ${key} =`, formData[key]);
        }
      });

      // Backend expects these exact field names as required fields
      // No need to delete and re-add, just ensure they're properly set

      const response = await axios.post('http://localhost:8000/api/admin/add-doctor', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.msg === "Success") {
        alert('Doctor added successfully!');
        navigate('/admin/dash/viewdoc');
      } else {
        alert('Error adding doctor: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('Error adding doctor: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/viewdoc')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Doctors</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Doctor</h1>
            <p className="text-gray-600 mt-1">Add a new doctor to your medical staff</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed transition-colors cursor-pointer ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    {formData.image ? (
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Preview" 
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <User className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        {dragActive && <p className="text-xs text-blue-600">Drop image here</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerFileInput}
                      className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{formData.image ? 'Change Photo' : 'Upload Photo'}</span>
                    </Button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {formData.image && (
                      <p className="text-sm text-green-600">✓ Photo uploaded: {formData.image.name}</p>
                    )}
                    <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="doctor@healthnexus.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="DOC123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter doctor password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty *
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="150"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="MD, MBBS, Specialist in Cardiology"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Availability
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.availableDays.includes(day)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time
                  </label>
                  <input
                    type="text"
                    name="availableTime"
                    value={formData.availableTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="9:00 AM - 5:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="123 Medical Center, Healthcare City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / About Doctor
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Brief description about the doctor's expertise and experience..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/viewdoc')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding Doctor...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Add Doctor</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModernAddDoctor;
