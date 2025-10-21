import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Trash2,
  Heart,
  Users,
  Activity,
  FileText,
  AlertTriangle,
  Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PatientSidenav from './PatientSidenav';
import axios from 'axios';

function PatientProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    profilePhoto: null
  });
  const [editedInfo, setEditedInfo] = useState({});

  useEffect(() => {
    checkAuthentication();
    fetchPatientProfile();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'patient') {
      navigate('/');
      return;
    }
  };

  const fetchPatientProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user.id;

      console.log('Fetching profile for user ID:', patientId);

      // Try the new auth profile endpoint first
      const response = await axios.get(`http://localhost:8000/api/auth/profile/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        console.log('Fetched user data from API:', userData);
        
        const profileData = {
          name: userData.name || 'Patient',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          bloodGroup: userData.bloodGroup || '',
          address: userData.address || '',
          emergencyContact: userData.emergencyContact || userData.phone || '',
          profilePhoto: userData.image || null, // Map backend 'image' to frontend 'profilePhoto'
          // Additional patient-specific fields
          patientId: userData._id || '',
          registrationDate: userData.createdAt || new Date().toISOString(),
          medicalHistory: userData.condition || '',
          allergies: userData.allergies || '',
          currentMedications: userData.currentMedications || '',
          // Additional fields from your patient data
          age: userData.age || '',
          condition: userData.condition || 'General Checkup',
          status: userData.status || 'Active',
          lastVisit: userData.lastVisit || userData.createdAt || ''
        };
        
        console.log('Profile data with image:', profileData);
        
        setPatientInfo(profileData);
        setEditedInfo(profileData);
        // Persist fetched image/name into localStorage so Sidenav can render avatar immediately
        try {
          const userLS = JSON.parse(localStorage.getItem('user') || '{}');
          const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
          const updatedUser = {
            ...userLS,
            name: profileData.name,
            email: profileData.email || userLS.email,
            phone: profileData.phone || userLS.phone,
            image: profileData.profilePhoto,
            profilePhoto: profileData.profilePhoto,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (patientLS && Object.keys(patientLS).length > 0) {
            const updatedPatient = {
              ...patientLS,
              name: profileData.name,
              email: profileData.email || patientLS.email,
              phone: profileData.phone || patientLS.phone,
              image: profileData.profilePhoto,
              profilePhoto: profileData.profilePhoto,
            };
            localStorage.setItem('patient', JSON.stringify(updatedPatient));
          }
          window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
          try {
            window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(updatedUser), storageArea: localStorage }));
          } catch {}
        } catch {}
        return;
      }
    } catch (error) {
      console.error('Error fetching from auth profile:', error);
      
      // Fallback to old patient API
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const patientId = user.id;

        const response = await axios.get(`http://localhost:8000/api/patient/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setPatientInfo(response.data.patient);
          setEditedInfo(response.data.patient);
          return;
        }
      } catch (fallbackError) {
        console.error('Error fetching from patient API:', fallbackError);
      }
      
      // Final fallback to localStorage data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patient = JSON.parse(localStorage.getItem('patient') || '{}');
      
      console.log('Patient Profile - User data:', user);
      console.log('Patient Profile - Patient data:', patient);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Prefer patient data over user data since it has more complete information
      const sourceData = Object.keys(patient).length > 0 ? patient : user;
      
      const actualData = {
        name: sourceData?.name || 'Patient',
        email: sourceData?.email || '',
        phone: sourceData?.phone || '',
        dateOfBirth: sourceData?.dateOfBirth || sourceData?.dob || '',
        gender: sourceData?.gender || '',
        bloodGroup: sourceData?.bloodGroup || '',
        address: sourceData?.address || '',
        emergencyContact: sourceData?.emergencyContact || sourceData?.phone || '',
        profilePhoto: sourceData?.profilePhoto || sourceData?.avatar || null,
        // Additional patient-specific fields
        patientId: sourceData?._id || sourceData?.id || '',
        registrationDate: sourceData?.createdAt || sourceData?.registeredAt || new Date().toISOString(),
        medicalHistory: sourceData?.medicalHistory || sourceData?.condition || '',
        allergies: sourceData?.allergies || '',
        currentMedications: sourceData?.currentMedications || '',
        // Additional fields from your patient data
        age: sourceData?.age || '',
        condition: sourceData?.condition || '',
        status: sourceData?.status || '',
        lastVisit: sourceData?.lastVisit || ''
      };
      
      console.log('Final actualData:', actualData);
      
      setPatientInfo(actualData);
      setEditedInfo(actualData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({ ...patientInfo });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({ ...patientInfo });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user.id;

      // Prepare data for backend - map profilePhoto to image field
      const backendData = {
        ...editedInfo,
        image: editedInfo.profilePhoto // Backend expects 'image' field
      };
      delete backendData.profilePhoto; // Remove frontend-specific field

      console.log('Saving profile data:', backendData);

      // Try the new auth profile endpoint first
      const response = await axios.put(`http://localhost:8000/api/auth/profile/${patientId}`, backendData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPatientInfo(editedInfo);
        setIsEditing(false);
        // Persist updated photo/name to localStorage for sidenav/avatar
        try {
          const userLS = JSON.parse(localStorage.getItem('user') || '{}');
          const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
          const updatedUser = { ...userLS, name: editedInfo.name, email: editedInfo.email, phone: editedInfo.phone, image: editedInfo.profilePhoto, profilePhoto: editedInfo.profilePhoto };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (patientLS && Object.keys(patientLS).length > 0) {
            const updatedPatient = { ...patientLS, name: editedInfo.name, email: editedInfo.email, phone: editedInfo.phone, image: editedInfo.profilePhoto, profilePhoto: editedInfo.profilePhoto };
            localStorage.setItem('patient', JSON.stringify(updatedPatient));
          }
          // Notify listeners (e.g., PatientSidenav)
          window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
        } catch {}
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
          duration: 2000,
        });
        return;
      }
    } catch (error) {
      console.error('Error updating profile via auth:', error);
      
      // Fallback to old patient API
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const patientId = user.id;

        const response = await axios.put(`http://localhost:8000/api/patient/${patientId}`, editedInfo, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setPatientInfo(editedInfo);
          setIsEditing(false);
          // Persist to localStorage and notify UI
          try {
            const userLS = JSON.parse(localStorage.getItem('user') || '{}');
            const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
            const updatedUser = { ...userLS, name: editedInfo.name, email: editedInfo.email, phone: editedInfo.phone, image: editedInfo.profilePhoto, profilePhoto: editedInfo.profilePhoto };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (patientLS && Object.keys(patientLS).length > 0) {
              const updatedPatient = { ...patientLS, name: editedInfo.name, email: editedInfo.email, phone: editedInfo.phone, image: editedInfo.profilePhoto, profilePhoto: editedInfo.profilePhoto };
              localStorage.setItem('patient', JSON.stringify(updatedPatient));
            }
            window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
          } catch {}
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
            duration: 2000,
          });
          return;
        }
      } catch (fallbackError) {
        console.error('Error updating via patient API:', fallbackError);
      }
      
      // Final fallback - just update locally
      setPatientInfo(editedInfo);
      setIsEditing(false);
      // Persist to localStorage and notify UI
      try {
        const userLS = JSON.parse(localStorage.getItem('user') || '{}');
        const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
        const updatedUser = { ...userLS, name: editedInfo.name, email: editedInfo.email, phone: editedInfo.phone, image: editedInfo.profilePhoto, profilePhoto: editedInfo.profilePhoto };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (patientLS && Object.keys(patientLS).length > 0) {
          const updatedPatient = { ...patientLS, name: editedInfo.name, email: editedInfo.email, phone: editedInfo.phone, image: editedInfo.profilePhoto, profilePhoto: editedInfo.profilePhoto };
          localStorage.setItem('patient', JSON.stringify(updatedPatient));
        }
        window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
      } catch {}
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        duration: 2000,
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const newProfilePhoto = e.target.result;
        
        // Update the edited info
        setEditedInfo(prev => ({
          ...prev,
          profilePhoto: newProfilePhoto
        }));

        // Auto-save the profile photo to backend
        try {
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const patientId = user.id;

          const backendData = {
            image: newProfilePhoto // Backend expects 'image' field
          };

          console.log('Auto-saving profile photo...');

          const response = await axios.put(`http://localhost:8000/api/auth/profile/${patientId}`, backendData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data.success) {
            // Update the main profile info with the new photo
            setPatientInfo(prev => ({
              ...prev,
              profilePhoto: newProfilePhoto
            }));
            // Persist to localStorage and inform listeners for immediate sidenav refresh
            try {
              const userLS = JSON.parse(localStorage.getItem('user') || '{}');
              const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
              localStorage.setItem('user', JSON.stringify({ ...userLS, image: newProfilePhoto, profilePhoto: newProfilePhoto }));
              if (patientLS && Object.keys(patientLS).length > 0) {
                localStorage.setItem('patient', JSON.stringify({ ...patientLS, image: newProfilePhoto, profilePhoto: newProfilePhoto }));
              }
              window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
            } catch {}
            
            toast({
              title: "Profile Photo Updated",
              description: "Your profile photo has been saved successfully.",
              duration: 2000,
            });
          }
        } catch (error) {
          console.error('Error auto-saving profile photo:', error);
          // Still update localStorage so UI reflects change immediately
          try {
            const userLS = JSON.parse(localStorage.getItem('user') || '{}');
            const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...userLS, image: newProfilePhoto, profilePhoto: newProfilePhoto }));
            if (patientLS && Object.keys(patientLS).length > 0) {
              localStorage.setItem('patient', JSON.stringify({ ...patientLS, image: newProfilePhoto, profilePhoto: newProfilePhoto }));
            }
            window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
          } catch {}
          toast({
            title: "Photo Upload",
            description: "Photo uploaded. Please click Save to persist changes.",
            variant: "default",
            duration: 2000,
          });
        }
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
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const currentInfo = isEditing ? editedInfo : patientInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="flex flex-col lg:flex-row">
        <PatientSidenav />
        
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-0 lg:pt-6 pb-4 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-2 sm:p-4 text-white shadow-lg mx-1 sm:mx-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-bold mb-1 truncate">My Profile</h2>
                <p className="text-indigo-100 text-xs sm:text-sm truncate">
                  Manage your personal information and preferences
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <User className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mx-1 sm:mx-0">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Profile Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {currentInfo.profilePhoto ? (
                    <img 
                      src={currentInfo.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-pink-600 rounded-full p-1 sm:p-2 cursor-pointer hover:bg-pink-700 transition-colors">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
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
              <div className="flex-1 text-center sm:text-left min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={currentInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-lg sm:text-xl font-bold text-gray-900 bg-gray-50 border rounded px-2 sm:px-3 py-1 w-full mb-2 text-sm sm:text-base"
                  />
                ) : (
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate">{currentInfo.name}</h1>
                )}
                
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-pink-600 mb-2">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Patient</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                  {isEditing ? (
                    <select
                      value={currentInfo.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="bg-gray-50 border rounded px-2 py-1 text-xs sm:text-sm"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <span className="text-xs sm:text-sm truncate">Blood Group: {currentInfo.bloodGroup}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="text-xs sm:text-sm">
                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} size="sm" className="bg-pink-600 hover:bg-pink-700 text-xs sm:text-sm">
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Compact Profile Details */}
          <div className="space-y-3 sm:space-y-4">
            {/* Contact Information */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Contact Information</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={currentInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm truncate">{currentInfo.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Address</p>
                    {isEditing ? (
                      <textarea
                        value={currentInfo.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 h-16 sm:h-20 resize-none text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Emergency Contact</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentInfo.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.emergencyContact}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Date of Birth</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={currentInfo.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">{new Date(currentInfo.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Gender</p>
                    {isEditing ? (
                      <select
                        value={currentInfo.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.gender}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Blood Group</p>
                    <p className="font-medium text-gray-900 text-sm">{currentInfo.bloodGroup}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Medical Information */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 mt-3 sm:mt-4">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Medical Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Patient ID</p>
                  <p className="font-medium text-gray-900 text-sm truncate">{currentInfo.patientId}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Registration Date</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {currentInfo.registrationDate ? new Date(currentInfo.registrationDate).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Age</p>
                  <p className="font-medium text-gray-900 text-sm">{currentInfo.age || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Status</p>
                  <p className={`font-medium text-sm ${currentInfo.status === 'Active' ? 'text-green-600' : 'text-gray-900'}`}>
                    {currentInfo.status || 'Not available'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Last Visit</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {currentInfo.lastVisit ? new Date(currentInfo.lastVisit).toLocaleDateString() : 'No visits yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3 sm:col-span-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Medical History</p>
                  {isEditing ? (
                    <textarea
                      value={currentInfo.medicalHistory}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 h-16 sm:h-20 resize-none text-sm"
                      placeholder="Enter medical history..."
                    />
                  ) : (
                    <p className="font-medium text-gray-900 text-sm">{currentInfo.medicalHistory}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Allergies</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentInfo.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      placeholder="Enter allergies..."
                    />
                  ) : (
                    <p className="font-medium text-gray-900 text-sm">{currentInfo.allergies}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Current Medications</p>
                  {isEditing ? (
                    <textarea
                      value={currentInfo.currentMedications}
                      onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                      className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 h-16 sm:h-20 resize-none text-sm"
                      placeholder="Enter current medications..."
                    />
                  ) : (
                    <p className="font-medium text-gray-900 text-sm">{currentInfo.currentMedications}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Danger Zone */}
          {!isEditing && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 mt-3 sm:mt-4">
              <h3 className="text-sm sm:text-lg font-semibold text-red-600 mb-2 sm:mb-3">Danger Zone</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Once you delete your account, there is no going back. Please be certain.</p>
              <Button 
                onClick={handleDeleteAccount}
                variant="destructive"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Delete Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
