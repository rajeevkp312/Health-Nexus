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
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';

export function DoctorFeedback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientMap, setPatientMap] = useState({}); // uid -> { name }

  const feedbackTypes = ['all', 'Feedback', 'Suggestion', 'Complain'];
  const statusTypes = ['all', 'pending', 'reviewed', 'resolved'];

  useEffect(() => {
    checkAuthentication();
    fetchDoctorInfo();
    fetchDoctorFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, filterType, filterStatus, searchTerm]);

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

  const fetchDoctorInfo = () => {
    const user = localStorage.getItem('user');
    const doctor = localStorage.getItem('doctor');
    
    if (user) {
      setDoctorInfo(JSON.parse(user));
    } else if (doctor) {
      setDoctorInfo(JSON.parse(doctor));
    }
  };

  const fetchDoctorFeedbacks = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
      const doctorId = user.id || doctor._id;

      // Fetch feedbacks targeted to this doctor
      const response = await axios.get(`http://localhost:8000/api/feed/doctor/${doctorId}`);
      if (response.data.msg === "Success") {
        const items = response.data.value || [];
        setFeedbacks(items);

        // Build patient name map
        const uniqueUids = [...new Set(items.map(f => f.uid).filter(Boolean))];
        if (uniqueUids.length) {
          const entries = await Promise.all(uniqueUids.map(async (uid) => {
            try {
              const r = await axios.get(`http://localhost:8000/api/patient/${uid}`);
              if (r.data.msg === 'Success' && r.data.value) {
                return [uid, { name: r.data.value.name || 'Patient' }];
              }
            } catch (e) {}
            return [uid, { name: 'Patient' }];
          }));
          setPatientMap(Object.fromEntries(entries));
        } else {
          setPatientMap({});
        }
      } else {
        setFeedbacks([]);
        setPatientMap({});
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
      setPatientMap({});
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    let filtered = feedbacks;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(feedback => feedback.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(feedback => {
        const term = searchTerm.toLowerCase();
        const text = (feedback.message || feedback.msg || '').toLowerCase();
        const type = (feedback.type || '').toLowerCase();
        const uidStr = (feedback.uid || '').toString().toLowerCase();
        const pname = (patientMap[feedback.uid]?.name || '').toLowerCase();
        return text.includes(term) || type.includes(term) || uidStr.includes(term) || pname.includes(term);
      });
    }

    setFilteredFeedbacks(filtered);
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/feed/${feedbackId}`, {
        status: newStatus
      });
      
      if (response.data.msg === "Success") {
        toast({
          title: "Status Updated! ✅",
          description: `Feedback marked as ${newStatus}.`,
          duration: 2000,
        });
        
        // Refresh feedbacks
        fetchDoctorFeedbacks();
      } else {
        toast({
          title: "Update Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: "Update Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-500 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-600 text-white border-green-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Feedback': return 'bg-blue-500 text-blue-800';
      case 'Suggestion': return 'bg-green-500 text-green-800';
      case 'Complain': return 'bg-red-500 text-red-800';
      default: return 'bg-gray-500 text-gray-800';
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

  const getStats = () => {
    const total = feedbacks.length;
    const pending = feedbacks.filter(f => f.status === 'pending').length;
    const reviewed = feedbacks.filter(f => f.status === 'reviewed').length;
    const resolved = feedbacks.filter(f => f.status === 'resolved').length;
    const avgRating = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : 0;

    return { total, pending, reviewed, resolved, avgRating };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />
        
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-2 sm:space-y-4 overflow-x-hidden max-w-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-blue-100 rounded-full p-1.5 sm:p-3 flex-shrink-0">
                <MessageCircle className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">Patient Feedback</h1>
                <p className="text-xs sm:text-base text-gray-600 truncate">Review and manage patient feedback</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 mx-1 sm:mx-0">
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.reviewed}</p>
                <p className="text-xs sm:text-sm text-gray-600">Reviewed</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-xs sm:text-sm text-gray-600">Resolved</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              >
                {feedbackTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              >
                {statusTypes.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback List */}
          <div className="bg-white rounded-lg shadow-sm border mx-1 sm:mx-0">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFeedbacks.length > 0 ? (
              <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                {filteredFeedbacks.map((feedback) => (
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
                          <span className="text-xs text-secondary">Patient: {patientMap[feedback.uid]?.name || feedback.uid}</span>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-900 mb-2">{feedback.message || feedback.msg}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  star <= (feedback.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {feedback.rating || 0}/5 stars
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          Submitted on {formatDate(feedback.createdAt)}
                        </p>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-wrap gap-1 sm:gap-2 flex-shrink-0">
                        {feedback.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              onClick={() => handleStatusUpdate(feedback._id, 'reviewed')}
                            >
                              Mark Reviewed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs bg-green-600 border-green-700 text-white hover:bg-green-700"
                              onClick={() => handleStatusUpdate(feedback._id, 'resolved')}
                            >
                              Mark Resolved
                            </Button>
                          </>
                        )}
                        {feedback.status === 'reviewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 text-xs bg-green-600 border-green-700 text-white hover:bg-green-700"
                            onClick={() => handleStatusUpdate(feedback._id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {feedback.status === 'resolved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 text-xs bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                            onClick={() => handleStatusUpdate(feedback._id, 'pending')}
                          >
                            Reopen
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
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'No feedback matches your current filters.'
                    : 'No patient feedback available yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorFeedback;
