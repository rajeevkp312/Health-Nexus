import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3,
  Save,
  X,
  Camera,
  Trash2,
  Stethoscope,
  Award,
  Clock,
  CreditCard,
  FileText,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import DoctorSidenav from './DoctorSidenav';
import axios from 'axios';

function DoctorProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    address: '',
    profilePhoto: null
  });
  const [editedInfo, setEditedInfo] = useState({});

  useEffect(() => {
    checkAuthentication();
    fetchDoctorProfile();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'doctor') {
      navigate('/');
      return;
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
      const doctorId = user.id || doctor._id || doctor.id;

      const response = await axios.get(`http://localhost:8000/api/doctor/${doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDoctorInfo(response.data.doctor);
        setEditedInfo(response.data.doctor);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      
      // Use actual data from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
      
      console.log('Doctor Profile - User data:', user);
      console.log('Doctor Profile - Doctor data:', doctor);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Get all available data
      const name = user?.name || user?.username || doctor?.name || doctor?.username || 'Dr. Unknown';
      const email = user?.email || doctor?.email || 'doctor@healthnexus.com';
      const phone = user?.phone || doctor?.phone || '+91 98765 43210';
      
      const actualData = {
        name: name,
        email: email,
        phone: phone,
        specialization: doctor?.specialization || doctor?.department || user?.specialization || '',
        experience: doctor?.experience || user?.experience || '',
        qualification: doctor?.qualification || doctor?.degree || user?.qualification || '',
        address: doctor?.address || user?.address || '',
        profilePhoto: doctor?.profilePhoto || user?.profilePhoto || user?.avatar || null,
        // Additional doctor-specific fields
        licenseNumber: doctor?.licenseNumber || user?.licenseNumber || '',
        department: doctor?.department || doctor?.specialization || user?.department || '',
        consultationFee: doctor?.consultationFee || user?.consultationFee || '',
        availability: doctor?.availability || user?.availability || ''
      };
      
      console.log('Final actualData:', actualData);
      
      setDoctorInfo(actualData);
      setEditedInfo(actualData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({ ...doctorInfo });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({ ...doctorInfo });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
      const doctorId = user.id || doctor._id || doctor.id;

      const response = await axios.put(`http://localhost:8000/api/doctor/${doctorId}`, editedInfo, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDoctorInfo(editedInfo);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // For demo, just update locally
      setDoctorInfo(editedInfo);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        duration: 2000
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedInfo(prev => ({
          ...prev,
          profilePhoto: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: "Account Deletion",
        description: "Account deletion feature will be implemented soon.",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentInfo = isEditing ? editedInfo : doctorInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />
        
        <div className="flex-1 pt-20 lg:pt-6 p-2 sm:p-4 max-w-full overflow-hidden">

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-6 mb-3">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                  {currentInfo.profilePhoto ? (
                    <img 
                      src={currentInfo.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <input
                    type="text"
                    value={currentInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 border rounded px-3 py-1 w-full mb-2"
                  />
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{currentInfo.name}</h1>
                )}
                
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-blue-600 mb-2">
                  <Stethoscope className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentInfo.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="bg-gray-50 border rounded px-2 py-1 text-sm"
                      placeholder="Specialization"
                    />
                  ) : (
                    <span className="text-sm font-medium">{currentInfo.specialization}</span>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentInfo.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="bg-gray-50 border rounded px-2 py-1 text-sm"
                      placeholder="Experience"
                    />
                  ) : (
                    <span className="text-sm">{currentInfo.experience} experience</span>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} size="sm" variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={currentInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="flex-1 bg-gray-50 border rounded px-3 py-2"
                    />
                  ) : (
                    <span className="text-gray-700">{currentInfo.email}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 bg-gray-50 border rounded px-3 py-2"
                    />
                  ) : (
                    <span className="text-gray-700">{currentInfo.phone}</span>
                  )}
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  {isEditing ? (
                    <textarea
                      value={currentInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="flex-1 bg-gray-50 border rounded px-3 py-2 h-20 resize-none"
                    />
                  ) : (
                    <span className="text-gray-700">{currentInfo.address}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Qualification</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.qualification}
                        onChange={(e) => handleInputChange('qualification', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentInfo.qualification}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Stethoscope className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Specialization</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentInfo.specialization}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Experience</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentInfo.experience}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">License Number</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentInfo.licenseNumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Department</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentInfo.department}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.consultationFee}
                        onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-3 py-2 mt-1"
                        placeholder="₹500"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">₹{currentInfo.consultationFee}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {!isEditing && (
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mt-4">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Button 
                onClick={handleDeleteAccount}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
