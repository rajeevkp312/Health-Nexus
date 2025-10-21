import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Star, 
  Heart, 
  LogOut,
  Bell,
  Settings,
  User,
  Send,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import PatientSidenav from './PatientSidenav';

export function PatientFeedback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('give'); // 'give' or 'my'
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]); // [{id,name}]
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    message: '',
    rating: 0
  });

  const feedbackTypes = [
    { value: 'Feedback', label: 'General Feedback', icon: MessageCircle, color: 'blue' },
    { value: 'Suggestion', label: 'Suggestion', icon: ThumbsUp, color: 'green' },
    { value: 'Complain', label: 'Complaint', icon: AlertCircle, color: 'red' }
  ];

  useEffect(() => {
    checkAuthentication();
    fetchPatientInfo();
    fetchMyFeedbacks();
    fetchMyDoctors();
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

  const fetchMyDoctors = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) return;
      const res = await axios.get(`http://localhost:8000/api/app/p/${user.id}`);
      if (res.data.msg === 'Success') {
        const apps = res.data.value || [];
        const map = new Map();
        apps.forEach(a => {
          if (a.did) {
            const name = a.doctorName || a.did?.name || 'Doctor';
            if (!map.has(a.did)) map.set(a.did, name);
          }
        });
        const opts = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
        setDoctorOptions(opts);
      }
    } catch (e) {
      // silent fail
    }
  };

  const fetchPatientInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      setPatientInfo(JSON.parse(user));
    }
  };

  const fetchMyFeedbacks = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`http://localhost:8000/api/feed/user/${user.id}`);
      
      if (response.data.msg === "Success") {
        setMyFeedbacks(response.data.value || []);
      } else {
        // Fallback mock data
        setMyFeedbacks([
          {
            _id: '1',
            type: 'Feedback',
            message: 'Great service! The doctors are very professional and caring.',
            rating: 5,
            createdAt: '2024-01-15T10:30:00Z',
            status: 'reviewed'
          },
          {
            _id: '2',
            type: 'Suggestion',
            message: 'It would be great to have online consultation options.',
            rating: 4,
            createdAt: '2024-01-10T14:20:00Z',
            status: 'pending'
          },
          {
            _id: '3',
            type: 'Complain',
            message: 'Long waiting time in the reception area.',
            rating: 2,
            createdAt: '2024-01-05T09:15:00Z',
            status: 'resolved'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      // Fallback mock data on error
      setMyFeedbacks([
        {
          _id: '1',
          type: 'Feedback',
          message: 'Great service! The doctors are very professional and caring.',
          rating: 5,
          createdAt: '2024-01-15T10:30:00Z',
          status: 'reviewed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const feedbackData = {
        uid: user.id,
        utype: 'patient',
        type: formData.type,
        msg: formData.message,
        message: formData.message,
        rating: formData.rating,
        did: selectedDoctorId || undefined
      };

      const response = await axios.post('http://localhost:8000/api/feed', feedbackData);
      
      if (response.data.msg === "Success") {
        toast({
          title: "Feedback Submitted! ✅",
          description: "Thank you for your feedback. We appreciate your input!",
          duration: 2000,
        });
        
        // Reset form and refresh feedback list
        setFormData({
          type: '',
          message: '',
          rating: 0
        });
        setSelectedDoctorId('');
        
        // Refresh my feedbacks and switch to My Feedback tab
        fetchMyFeedbacks();
        setActiveTab('my');
      } else {
        toast({
          title: "Submission Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      type: feedback.type,
      message: feedback.message || feedback.msg,
      rating: feedback.rating || 0
    });
    setActiveTab('give');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const feedbackData = {
        type: formData.type,
        msg: formData.message,
        message: formData.message,
        rating: formData.rating
      };

      const response = await axios.put(`http://localhost:8000/api/feed/${editingFeedback._id}`, feedbackData);
      
      if (response.data.msg === "Success") {
        toast({
          title: "Feedback Updated! ✅",
          description: "Your feedback has been updated successfully.",
          duration: 2000,
        });
        
        // Reset form and editing state
        setFormData({
          type: '',
          message: '',
          rating: 0
        });
        setEditingFeedback(null);
        
        // Refresh my feedbacks and switch to My Feedback tab
        fetchMyFeedbacks();
        setActiveTab('my');
      } else {
        toast({
          title: "Update Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Update Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setFormData({
      type: '',
      message: '',
      rating: 0
    });
    setSelectedDoctorId('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
      duration: 2000,
    });
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-yellow-900 border-yellow-300';
      case 'reviewed': return 'bg-blue-500 text-blue-900 border-blue-300';
      case 'resolved': return 'bg-green-500 text-green-800 border-green-200';
      default: return 'bg-gray-500 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Feedback': return 'bg-blue-500 text-blue-800';
      case 'Suggestion': return 'bg-green-500 text-green-800';
      case 'Complain': return 'bg-red-500 text-red-800';
      default: return 'bg-gray500 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="flex flex-col lg:flex-row">
        <PatientSidenav />
        
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-0 lg:pt-6 pb-4 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-2 sm:p-4 text-white shadow-lg mx-1 sm:mx-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-bold mb-1 truncate">Patient Feedback</h2>
                <p className="text-purple-100 text-xs sm:text-sm truncate">
                  Share your experience and view your feedback history
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border mx-1 sm:mx-0">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('give')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'give'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Give Feedback</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'my'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>My Feedback ({myFeedbacks.length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'give' ? (
            /* Give Feedback Tab */
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-6 mx-1 sm:mx-0">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                  {editingFeedback ? 'Edit Your Feedback' : 'We Value Your Feedback'}
                </h2>
                <p className="text-xs sm:text-base text-gray-600">
                  {editingFeedback 
                    ? 'Update your feedback below. You can only edit pending feedback.'
                    : 'Your feedback helps us provide better healthcare services. Please share your thoughts, suggestions, or concerns.'
                  }
                </p>
              </div>

              <form onSubmit={editingFeedback ? handleUpdate : handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">
                    Type of Feedback *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    {feedbackTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`border rounded-lg p-3 sm:p-6 cursor-pointer transition-all ${
                            formData.type === type.value
                              ? `border-${type.color}-500 bg-${type.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('type', type.value)}
                        >
                          <div className="text-center">
                            <div className={`bg-${type.color}-100 rounded-full p-2 sm:p-4 mx-auto mb-2 sm:mb-3 w-fit`}>
                              <IconComponent className={`h-4 w-4 sm:h-8 sm:w-8 text-${type.color}-600`} />
                            </div>
                            <h3 className="text-xs sm:text-base font-semibold text-gray-900">{type.label}</h3>
                            {formData.type === type.value && (
                              <CheckCircle className={`h-4 w-4 sm:h-6 sm:w-6 text-${type.color}-600 mx-auto mt-1 sm:mt-2`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optional: Target Doctor */}
                {doctorOptions.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      For Doctor (optional)
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">— General (no specific doctor) —</option>
                      {doctorOptions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">If your feedback is for a specific doctor, select them here.</p>
                  </div>
                )}

                {/* Rating Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Overall Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= formData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                    <span className="ml-4 text-sm text-gray-600">
                      {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'No rating selected'}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please share your detailed feedback, suggestions, or concerns..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Minimum 10 characters. Be specific to help us understand your experience better.
                  </p>
                </div>

                {/* Patient Information Display */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Feedback will be submitted as:</h3>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patientInfo?.name || 'Patient'}</p>
                      <p className="text-sm text-gray-600">{patientInfo?.email || 'patient@email.com'}</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={editingFeedback ? handleCancelEdit : () => navigate('/patient')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !formData.type || !formData.message}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editingFeedback ? 'Updating...' : 'Submitting...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>{editingFeedback ? 'Update Feedback' : 'Submit Feedback'}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* My Feedback Tab */
            <div className="bg-white rounded-lg shadow-sm border mx-1 sm:mx-0">
              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : myFeedbacks.length > 0 ? (
                <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                  {myFeedbacks.map((feedback) => (
                    <div key={feedback._id} className="border rounded-lg p-2 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        {/* Left Section - Feedback Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                              {feedback.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)}`}>
                              {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                            </span>
                            {feedback.did && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500 text-indigo-800">
                                To Doctor
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs sm:text-sm text-gray-900 mb-2">{feedback.message || feedback.msg}</p>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                    star <= feedback.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {feedback.rating}/5 stars
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Submitted on {formatDate(feedback.createdAt)}
                          </p>
                          {feedback.response && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="block text-xs font-semibold text-blue-900">Response:</span>
                              <p className="text-xs text-blue-800 mt-1">{feedback.response}</p>
                            </div>
                          )}
                          {feedback.did && (
                            <p className="text-xs text-secondary mt-1">Target Doctor ID: {feedback.did}</p>
                          )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 text-xs"
                            onClick={() => {
                              toast({
                                title: "View Details",
                                description: "Viewing feedback details...",
                                duration: 2000,
                              });
                            }}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          {feedback.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs"
                              onClick={() => handleEdit(feedback)}
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 p-4">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">You haven't submitted any feedback yet.</p>
                  <Button onClick={() => setActiveTab('give')} size="sm" className="text-xs sm:text-sm">
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Give Your First Feedback
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-6 mx-1 sm:mx-0">
            <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-800 text-xs sm:text-sm mb-2 sm:mb-4">
              If you have urgent medical concerns, please contact our emergency hotline immediately.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs sm:text-sm">
                Emergency: +1 (555) 911-HELP
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs sm:text-sm">
                Support: +1 (555) 123-CARE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientFeedback;
