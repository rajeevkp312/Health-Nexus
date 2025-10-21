import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  X,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export function ModernViewEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const statusOptions = [
    'All Status', 'Pending', 'In Progress', 'Resolved', 'Closed'
  ];

  const fetchEnquiries = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get('http://localhost:8000/api/admin/enquiries');
      if (response.data.msg === "Success") {
        setEnquiries(response.data.enquiries || []);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      // Mock data for demonstration
      setEnquiries([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          subject: 'Appointment Booking Issue',
          message: 'I am having trouble booking an appointment through the website. The system keeps showing an error message.',
          status: 'Pending',
          createdAt: '2024-01-15T10:30:00Z',
          priority: 'High'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1 (555) 987-6543',
          subject: 'Insurance Coverage Query',
          message: 'Can you please clarify which insurance plans are accepted at your facility?',
          status: 'In Progress',
          createdAt: '2024-01-14T14:20:00Z',
          priority: 'Medium'
        },
        {
          _id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@email.com',
          phone: '+1 (555) 456-7890',
          subject: 'Medical Records Request',
          message: 'I need to request copies of my medical records from my last visit.',
          status: 'Resolved',
          createdAt: '2024-01-13T09:15:00Z',
          priority: 'Low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'In Progress': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || filterStatus === 'All Status' || 
                         enquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Enquiries Management</h1>
          <p className="text-gray-600 mt-1">Manage customer enquiries and support requests</p>
        </div>
        <div className="flex items-center space-x-2 opacity-100 relative z-10" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>
          <div className="flex items-center space-x-4 text-sm opacity-100 relative z-10" style={{ color: '#000000', opacity: 1 }}>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-black font-semibold" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-black font-semibold" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>In Progress</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-black font-semibold" style={{ color: '#000000', opacity: 1, mixBlendMode: 'normal' }}>Resolved</span>
            </div>
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
                placeholder="Search enquiries by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              {statusOptions.map(status => (
                <option key={status} value={status === 'All Status' ? '' : status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEnquiries.map((enquiry) => (
          <div
            key={enquiry._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Enquiry Header */}
            <div className="relative h-20 bg-gradient-to-r from-blue-500 to-teal-500">
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(enquiry.priority)}`}>
                    {enquiry.priority}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-2 left-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(enquiry.status)}`}>
                  {getStatusIcon(enquiry.status)}
                  <span>{enquiry.status}</span>
                </div>
              </div>
            </div>

            {/* Enquiry Info */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{enquiry.subject}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{enquiry.message}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-800">{enquiry.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{enquiry.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{enquiry.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{formatDate(enquiry.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedEnquiry(enquiry)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEnquiries.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus 
              ? 'Try adjusting your search or filter criteria'
              : 'No enquiries have been submitted yet'
            }
          </p>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Enquiry Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedEnquiry.status)}`}>
                    {getStatusIcon(selectedEnquiry.status)}
                    <span>{selectedEnquiry.status}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedEnquiry.priority)}`}>
                    {selectedEnquiry.priority} Priority
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedEnquiry.subject}</h3>
                  <p className="text-gray-600">{selectedEnquiry.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">Name:</span>
                    <p className="text-gray-600">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Email:</span>
                    <p className="text-gray-600">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Phone:</span>
                    <p className="text-gray-600">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Date:</span>
                    <p className="text-gray-600">{formatDate(selectedEnquiry.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply to Enquiry</span>
                </Button>
                <Button 
                  onClick={() => setSelectedEnquiry(null)}
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

export default ModernViewEnquiries;
