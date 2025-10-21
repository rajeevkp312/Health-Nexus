import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye,
  User,
  MessageSquare,
  Heart,
  X,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
export function ModernViewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [patientMap, setPatientMap] = useState({}); // uid -> { name }
  const [updating, setUpdating] = useState(false);
  const location = useLocation();

  const typeOptions = [
    'All Types', 'Feedback', 'Suggestion', 'Complain'
  ];

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/feedback');
      if (response.data.msg === "Success") {
        setFeedbacks(response.data.feedback || []);
        // Build patient name map for display (admin route doesn't populate names)
        const items = response.data.feedback || [];
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
        }
      } else {
        setFeedbacks([]);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Initialize filter from URL query param: ?type=Complain | Suggestion | Feedback
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const t = params.get('type');
      if (t) {
        setFilterType(t);
      }
    } catch {}
  }, [location.search]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const searchText = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         (feedback.uid && feedback.uid.toLowerCase().includes(searchText)) ||
                         (feedback.type && feedback.type.toLowerCase().includes(searchText)) ||
                         (feedback.msg && feedback.msg.toLowerCase().includes(searchText)) ||
                         (feedback.utype && feedback.utype.toLowerCase().includes(searchText));
    
    // Filter by feedback type
    const matchesType = filterType === '' || filterType === 'All Types' || feedback.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRespond = async (feedback) => {
    const responseText = window.prompt('Enter your response to the user:');
    if (!responseText) return;
    try {
      setUpdating(true);
      const res = await axios.put(`http://localhost:8000/api/feed/${feedback._id}`, {
        response: responseText,
        status: 'reviewed'
      });
      if (res.data.msg === 'Success') {
        setFeedbacks(prev => prev.map(f => f._id === feedback._id ? { ...f, response: responseText, status: 'reviewed' } : f));
        if (selectedFeedback && selectedFeedback._id === feedback._id) {
          setSelectedFeedback({ ...selectedFeedback, response: responseText, status: 'reviewed' });
        }
        window.alert('Response saved');
      } else {
        window.alert('Failed to save response');
      }
    } catch (e) {
      console.error(e);
      window.alert('Network error while saving response');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleImportant = async (feedback) => {
    const newVal = !feedback.important;
    try {
      setUpdating(true);
      const res = await axios.put(`http://localhost:8000/api/feed/${feedback._id}`, {
        important: newVal
      });
      if (res.data.msg === 'Success') {
        setFeedbacks(prev => prev.map(f => f._id === feedback._id ? { ...f, important: newVal } : f));
        if (selectedFeedback && selectedFeedback._id === feedback._id) {
          setSelectedFeedback({ ...selectedFeedback, important: newVal });
        }
      } else {
        window.alert('Failed to update flag');
      }
    } catch (e) {
      console.error(e);
      window.alert('Network error while updating flag');
    } finally {
      setUpdating(false);
    }
  };

  // Since the backend data doesn't have ratings, we'll show total count instead
  const totalFeedbacks = feedbacks.length;

  if (loading) {
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-secondary mt-1">Monitor patient feedback and service quality</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <span className="inline-block px-2 py-1 rounded bg-blue-600 text-white text-lg font-bold leading-none">{totalFeedbacks}</span>
            <p className="text-sm text-gray-600">Total Feedback</p>
          </div>
          <div className="text-center">
            <span className="inline-block px-2 py-1 rounded bg-blue-600 text-white text-lg font-bold leading-none">{feedbacks.filter(f => f.type === 'Feedback').length}</span>
            <p className="text-sm text-gray-600">Feedback</p>
          </div>
          <div className="text-center">
            <span className="inline-block px-2 py-1 rounded bg-blue-600 text-white text-lg font-bold leading-none">{feedbacks.filter(f => f.type === 'Suggestion').length}</span>
            <p className="text-sm text-gray-600">Suggestions</p>
          </div>
          <div className="text-center">
            <span className="inline-block px-2 py-1 rounded bg-blue-600 text-white text-lg font-bold leading-none">{feedbacks.filter(f => f.type === 'Complain').length}</span>
            <p className="text-sm text-gray-600">Complaints</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search feedback by user ID, type, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-secondary placeholder-gray-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-secondary"
            >
              {typeOptions.map(type => (
                <option key={type} value={type === 'All Types' ? '' : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Feedback Header */}
            <div className="relative h-20 bg-gradient-to-r from-blue-500 to-purple-500">
              <div className="absolute top-3 right-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${
                  feedback.type === 'Feedback' ? 'bg-green-100 text-green-800 border-green-200' :
                  feedback.type === 'Suggestion' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  feedback.type === 'Complain' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  <MessageSquare className="h-3 w-3" />
                  <span>{feedback.type}</span>
                </div>
              </div>
              <div className="absolute bottom-3 left-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-white font-medium text-sm">{feedback.utype}</span>
                </div>
              </div>
            </div>

            {/* Feedback Info */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-secondary">User ID: {feedback.uid}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    feedback.status === 'resolved' ? 'bg-green-600 text-white' :
                    feedback.status === 'pending' ? 'bg-yellow-600 text-white' :
                    feedback.status === 'reviewed' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {feedback.status || 'New'}
                  </span>
                </div>
                <p className="text-sm text-secondary line-clamp-3">{feedback.msg}</p>
                <p className="text-xs text-secondary mt-1">Patient: {patientMap[feedback.uid]?.name || 'N/A'}</p>
              </div>

              <div className="space-y-2 text-sm opacity-100" style={{ color: '#111827', opacity: 1 }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900" style={{ color: '#111827', opacity: 1 }}>User Type:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold" style={{ opacity: 1, mixBlendMode: 'normal' }}>{feedback.utype || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900" style={{ color: '#111827', opacity: 1 }}>Type:</span>
                  <span className={`px-2 py-0.5 rounded text-white font-semibold ${
                    feedback.type === 'Complain' ? 'bg-red-600' :
                    feedback.type === 'Suggestion' ? 'bg-green-600' :
                    'bg-blue-600'
                  }`} style={{ opacity: 1, mixBlendMode: 'normal' }}>{feedback.type || 'N/A'}</span>
                </div>
                {feedback.did && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900" style={{ color: '#111827', opacity: 1 }}>Doctor ID:</span>
                    <span className="px-2 py-0.5 rounded bg-gray-600 text-white font-semibold" style={{ opacity: 1, mixBlendMode: 'normal' }}>{feedback.did}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleRespond(feedback)}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Respond
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFeedbacks.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType 
              ? 'Try adjusting your search or filter criteria'
              : 'No feedback has been submitted yet'
            }
          </p>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6" style={{ color: '#111827', opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900">{selectedFeedback.type}</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    (selectedFeedback.status || '').toLowerCase() === 'resolved' ? 'bg-green-600 text-white' :
                    (selectedFeedback.status || '').toLowerCase() === 'pending' ? 'bg-yellow-600 text-white' :
                    (selectedFeedback.status || '').toLowerCase() === 'reviewed' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    <span>{selectedFeedback.status || 'New'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Message</h3>
                  <p className="text-gray-900 leading-relaxed">{selectedFeedback.msg}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">User ID:</span>
                    <p className="text-gray-900">{selectedFeedback.uid}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">User Type:</span>
                    <p className="text-gray-900">{selectedFeedback.utype}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Feedback Type:</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-white font-semibold mt-0.5 ${
                      (selectedFeedback.type || '') === 'Complain' ? 'bg-red-600' :
                      (selectedFeedback.type || '') === 'Suggestion' ? 'bg-green-600' :
                      'bg-blue-600'
                    }`}>{selectedFeedback.type}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Status:</span>
                    <p className="text-gray-900">{selectedFeedback.status || 'New'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-900">Patient Name:</span>
                    <p className="text-gray-900">{patientMap[selectedFeedback.uid]?.name || 'N/A'}</p>
                  </div>
                  {selectedFeedback.did && (
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-900">Doctor ID:</span>
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-600 text-white font-semibold mt-0.5">{selectedFeedback.did}</span>
                    </div>
                  )}
                  {selectedFeedback.response && (
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-900">Admin Response:</span>
                      <p className="text-gray-900">{selectedFeedback.response}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 text-white"
                  onClick={() => handleRespond(selectedFeedback)}
                  disabled={updating}
                >
                  <Reply className="h-4 w-4" />
                  <span>Respond to Feedback</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex items-center space-x-2 border-red-200 hover:bg-red-50 ${selectedFeedback.important ? 'text-red-700' : 'text-red-600'}`}
                  onClick={() => handleToggleImportant(selectedFeedback)}
                  disabled={updating}
                >
                  <Heart className="h-4 w-4" />
                  <span>{selectedFeedback.important ? 'Unmark Important' : 'Mark as Important'}</span>
                </Button>
                <Button 
                  onClick={() => setSelectedFeedback(null)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernViewFeedback;
