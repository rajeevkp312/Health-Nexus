import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Upload,
  Save,
  ArrowLeft,
  Heart,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export function ModernEditPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    bloodGroup: '',
    status: 'Active',
    condition: '',
    image: null
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const statusOptions = ['Active', 'Inactive', 'Critical', 'Recovered'];

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/patient/${id}`);
        if (response.data.msg === "Success") {
          const patient = response.data.value;
          setFormData({
            name: patient.name || '',
            email: patient.email || '',
            phone: patient.phone || '',
            age: patient.age || '',
            gender: patient.gender || '',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || '',
            medicalHistory: patient.medicalHistory || '',
            allergies: patient.allergies || '',
            bloodGroup: patient.bloodGroup || '',
            status: patient.status || 'Active',
            condition: patient.condition || '',
            image: null
          });
        } else {
          setSubmitError('Failed to load patient data');
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        setSubmitError('Error loading patient data. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      age: 'Age',
      gender: 'Gender',
      bloodGroup: 'Blood Group',
      address: 'Address'
    };

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = `${requiredFields[field]} is required`;
      }
    });

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate age
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 120)) {
      newErrors.age = 'Please enter a valid age between 0 and 120';
    }

    // Validate phone (basic validation)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      console.log('Form data before submission:', formData);
      
      // Send as JSON instead of FormData for better error handling
      const dataToSend = { ...formData };
      
      // Remove empty fields except for optional ones
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === null) {
          if (!['emergencyContact', 'medicalHistory', 'allergies', 'image'].includes(key)) {
            delete dataToSend[key];
          }
        }
      });
      
      // Remove image for now since we're sending JSON
      delete dataToSend.image;

      const response = await axios.put(`http://localhost:8000/api/patient/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.msg === "Success") {
        alert('Patient updated successfully!');
        navigate('/admin/dash/viewpatient');
      } else {
        setSubmitError(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.missingFields) {
          // Handle missing fields by setting individual field errors
          const newErrors = {};
          errorData.missingFields.forEach(field => {
            newErrors[field] = `${field} is required`;
          });
          setErrors(newErrors);
        }
        setSubmitError(errorData.error || 'Validation failed');
      } else {
        setSubmitError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/dash/viewpatient')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Patient</h1>
            <p className="text-gray-600 mt-1">Update patient information in the system</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error updating patient
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {submitError}
              </div>
            </div>
          </div>
        </div>
      )}

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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="patient@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.phone 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="120"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.age 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="25"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.gender 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.bloodGroup 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && (
                    <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                      errors.address 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="123 Main Street, City, State, ZIP"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-600" />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <input
                      type="text"
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="General Checkup"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Previous surgeries, chronic conditions, medications..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Food allergies, drug allergies, environmental allergies..."
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
            onClick={() => navigate('/admin/dash/viewpatient')}
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
                <span>Updating Patient...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Update Patient</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModernEditPatient;
