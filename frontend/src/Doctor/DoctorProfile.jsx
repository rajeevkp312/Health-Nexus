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
    profilePhoto: null,
    licenseNumber: '',
    department: '',
    consultationFee: '',
    availability: ''
  });
  const [editedInfo, setEditedInfo] = useState({});

  useEffect(() => {
    checkAuthentication();
    fetchDoctorProfile();
  }, []);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDoctorProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const doctor = localStorage.getItem('doctor');
    
    if (!token || (!user && !doctor)) {
      navigate('/');
      return;
    }

    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== 'doctor') {
        navigate('/');
        return;
      }
    }
  };

  // Resolve doctor Mongo _id robustly
  const resolveDoctorId = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorLS = JSON.parse(localStorage.getItem('doctor') || '{}');
      const localId = (doctorLS && (doctorLS._id || doctorLS.id)) || null;
      if (localId) return localId;

      const email = doctorLS?.email || user?.email;
      if (!email) return null;

      // Primary endpoint: /api/doctor
      try {
        const res = await axios.get('http://localhost:8000/api/doctor');
        if (res.data?.msg === 'Success') {
          const list = res.data.value || [];
          const match = list.find(d => d.email === email);
          if (match) {
            localStorage.setItem('doctor', JSON.stringify(match));
            return match._id;
          }
        }
      } catch (e) {}

      // Fallback endpoint: /api/admin/doctors
      try {
        const res2 = await axios.get('http://localhost:8000/api/admin/doctors');
        const list2 = (res2.data?.value || res2.data?.doctors || []);
        const match2 = list2.find(d => d.email === email);
        if (match2) {
          localStorage.setItem('doctor', JSON.stringify(match2));
          return match2._id;
        }
      } catch (e) {}

      return null;
    } catch (e) {
      console.error('resolveDoctorId error:', e);
      return null;
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
        const photoData = e.target.result;
        
        try {
          // Update both edited info and current doctor info
          setEditedInfo(prev => ({
            ...prev,
            profilePhoto: photoData
          }));
          
          // Get doctor ID for API call
          const doctorId = await resolveDoctorId();

          if (doctorId) {
            // Auto-save photo to database immediately
            const updateData = {
              image: photoData // Map profilePhoto to image for backend
            };

            console.log('Auto-saving photo to database...');
            const response = await axios.put(`http://localhost:8000/api/doctor/${doctorId}`, updateData);
            
            if (response.data.msg === "Success") {
              console.log('Photo saved to database successfully');
              
              // Update current doctor info state immediately
              setDoctorInfo(prev => ({
                ...prev,
                profilePhoto: photoData
              }));
              
              // Update localStorage after successful database save
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              user.profilePhoto = photoData;
              localStorage.setItem('user', JSON.stringify(user));

              // Cache the updated doctor from API if provided
              if (response.data.doctor) {
                const updatedDoc = response.data.doctor;
                localStorage.setItem('doctor', JSON.stringify({ ...updatedDoc, profilePhoto: photoData }));
              } else {
                const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
                localStorage.setItem('doctor', JSON.stringify({ ...doctor, profilePhoto: photoData, image: photoData }));
              }
              
              // Trigger event to refresh doctors section on home page
              window.dispatchEvent(new CustomEvent('doctorProfileUpdated'));
              
              toast({
                title: "Photo Updated! 📸",
                description: "Your profile photo has been updated and saved to database.",
                duration: 2000,
              });
            } else {
              throw new Error('Failed to save photo to database');
            }
          } else {
            // Fallback: save to localStorage only
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
            user.profilePhoto = photoData;
            localStorage.setItem('user', JSON.stringify(user));
            if (doctor && Object.keys(doctor).length > 0) {
              doctor.profilePhoto = photoData;
              localStorage.setItem('doctor', JSON.stringify(doctor));
            }
            toast({
              title: "Photo Updated! 📸",
              description: "Your profile photo has been updated locally.",
              duration: 2000,
            });
          }
        } catch (error) {
          console.error('Error saving photo:', error);
          
          // Fallback: save to localStorage only
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
          
          user.profilePhoto = photoData;
          localStorage.setItem('user', JSON.stringify(user));
          
          if (doctor && Object.keys(doctor).length > 0) {
            doctor.profilePhoto = photoData;
            localStorage.setItem('doctor', JSON.stringify(doctor));
          }
          
          toast({
            title: "Photo Updated! 📸",
            description: "Photo updated locally. Will sync to database on next save.",
            duration: 2000,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let doctor = JSON.parse(localStorage.getItem('doctor') || '{}');

      console.log('Doctor Profile - User data:', user);
      console.log('Doctor Profile - Doctor data (LS):', doctor);

      // Try to get fresh doctor doc from DB
      try {
        const id = await resolveDoctorId();
        if (id) {
          const res = await axios.get(`http://localhost:8000/api/doctor/${id}`);
          if (res.data?.msg === 'Success' && res.data?.value) {
            doctor = res.data.value;
            localStorage.setItem('doctor', JSON.stringify(doctor));
          }
        }
      } catch (e) {
        console.warn('Falling back to localStorage doctor:', e?.message || e);
      }

      const name = user?.name || doctor?.name || 'Doctor';
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=3b82f6&color=ffffff&bold=true`;

      const actualData = {
        name: name,
        email: user?.email || doctor?.email || '',
        phone: user?.phone || doctor?.phone || '',
        specialization: doctor?.specialty || doctor?.spe || doctor?.specialization || doctor?.department || '',
        experience: doctor?.experience || doctor?.exp || '',
        qualification: doctor?.qualification || doctor?.qua || doctor?.degree || '',
        address: doctor?.address || '',
        profilePhoto: doctor?.profilePhoto || doctor?.image || user?.profilePhoto || avatarUrl,
        licenseNumber: doctor?.number || doctor?.licenseNumber || '',
        department: doctor?.department || '',
        consultationFee: doctor?.consultationFee || '',
        availability: doctor?.availability || ''
      };

      setDoctorInfo(actualData);
      setEditedInfo(actualData);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({ ...doctorInfo });
  };

  const handleSave = async () => {
    try {
      // Resolve doctor ID robustly
      const doctorId = await resolveDoctorId();

      if (!doctorId) {
        throw new Error('Doctor ID not found');
      }

      // Prepare data for API call
      const updateData = {
        name: editedInfo.name,
        email: editedInfo.email,
        phone: editedInfo.phone,
        specialty: editedInfo.specialization, // Map specialization to specialty for backend
        number: editedInfo.licenseNumber, // Map licenseNumber to number for backend
        experience: editedInfo.experience,
        qualification: editedInfo.qualification,
        address: editedInfo.address,
        consultationFee: editedInfo.consultationFee,
        image: editedInfo.profilePhoto // Map profilePhoto to image for backend
      };

      // Debug logs
      console.log('Doctor ID:', doctorId);
      console.log('Update Data:', updateData);
      
      // Call API to update doctor in database
      const response = await axios.put(`http://localhost:8000/api/doctor/${doctorId}`, updateData);
      
      if (response.data.msg === "Success") {
        // Update local state
        setDoctorInfo(editedInfo);
        setIsEditing(false);
        
        // Update localStorage with new data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...user,
          name: editedInfo.name,
          email: editedInfo.email,
          phone: editedInfo.phone,
          profilePhoto: editedInfo.profilePhoto
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Cache the updated doctor from API if provided
        if (response.data.doctor) {
          // Ensure UI fields are available next load by normalizing
          const d = response.data.doctor;
          localStorage.setItem('doctor', JSON.stringify({
            ...d,
            specialty: d.specialty || editedInfo.specialization,
            number: d.number ?? editedInfo.licenseNumber,
          }));
        } else {
          const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
          const updatedDoctor = {
            ...doctor,
            name: editedInfo.name,
            email: editedInfo.email,
            phone: editedInfo.phone,
            specialty: editedInfo.specialization,
            number: editedInfo.licenseNumber,
            experience: editedInfo.experience,
            qualification: editedInfo.qualification,
            address: editedInfo.address,
            image: editedInfo.profilePhoto,
            consultationFee: editedInfo.consultationFee
          };
          localStorage.setItem('doctor', JSON.stringify(updatedDoctor));
        }
        
        toast({
          title: "Profile Updated! ✅",
          description: "Your profile has been successfully updated in database and will reflect on home page.",
          duration: 2000,
        });

        // Trigger event to refresh doctors section on home page
        window.dispatchEvent(new CustomEvent('doctorProfileUpdated'));
      } else {
        throw new Error('Failed to update profile in database');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: `Failed to save profile changes: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({ ...doctorInfo });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentInfo = isEditing ? editedInfo : doctorInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />
        
        <div className="flex-1 p-2 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6">

          {/* Compact Profile Header */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Profile Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 sm:border-4 border-white shadow-lg bg-gray-100">
                  {currentInfo.profilePhoto ? (
                    <img 
                      src={currentInfo.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentInfo.name || 'Doctor')}&size=128&background=3b82f6&color=ffffff&bold=true`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 sm:p-2 cursor-pointer hover:bg-blue-700 transition-colors">
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

              {/* Profile Info */}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                  {currentInfo.name || 'Doctor Name'}
                </h1>
                <p className="text-gray-600 text-sm mb-1 truncate">
                  {currentInfo.specialization || 'Specialization'}
                </p>
                <p className="text-xs text-gray-500 mb-2 sm:mb-3 truncate">
                  {currentInfo.experience || 'Experience'}
                </p>
                
                {!isEditing ? (
                  <Button onClick={handleEdit} size="sm" className="text-xs sm:text-sm">
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2 justify-center sm:justify-start">
                    <Button onClick={handleSave} size="sm" className="text-xs sm:text-sm">
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="text-xs sm:text-sm">
                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Cancel
                    </Button>
                  </div>
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
                      <p className="font-medium text-gray-900 text-sm truncate">{currentInfo.email || 'Not provided'}</p>
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
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.phone || 'Not provided'}</p>
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
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Qualification</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.qualification}
                        onChange={(e) => handleInputChange('qualification', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm truncate">{currentInfo.qualification || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Specialization</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm truncate">{currentInfo.specialization || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Experience</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">{currentInfo.experience || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">License Number</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm truncate">{currentInfo.licenseNumber || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 sm:col-span-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Consultation Fee</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.consultationFee}
                        onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                        className="w-full bg-gray-50 border rounded px-2 sm:px-3 py-1 sm:py-2 mt-1 text-sm"
                        placeholder="₹500"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 text-sm">
                        {currentInfo.consultationFee ? `₹${currentInfo.consultationFee}` : 'Not provided'}
                      </p>
                    )}
                  </div>
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

export default DoctorProfile;
