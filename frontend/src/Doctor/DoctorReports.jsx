import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function DoctorReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, draft
  const [publishingId, setPublishingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const doctorId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doc = JSON.parse(localStorage.getItem('doctor') || '{}');
    return doc._id || user.id;
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [doctorId]);

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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/reports/doctor/${doctorId}`);
      if (response.data.msg === 'Success') {
        setReports(response.data.value || []);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      toast({
        title: "Error loading reports",
        description: "Please try again later",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (reportId) => {
    try {
      setPublishingId(reportId);
      const response = await axios.put(`http://localhost:8000/api/reports/${reportId}/publish`);
      if (response.data.msg.includes('successfully')) {
        toast({
          title: "Report published",
          description: "Patient can now view this report",
          duration: 2000
        });
        fetchReports(); // Refresh the list
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('Error publishing report:', error);
      toast({
        title: "Failed to publish report",
        description: error.response?.data?.msg || "Please try again",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublish = async (reportId) => {
    try {
      setPublishingId(reportId);
      const response = await axios.put(`http://localhost:8000/api/reports/${reportId}/unpublish`);
      if (response.data.msg.includes('successfully')) {
        toast({
          title: "Report unpublished",
          description: "Report is now hidden from patient",
          duration: 2000
        });
        fetchReports(); // Refresh the list
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('Error unpublishing report:', error);
      toast({
        title: "Failed to unpublish report",
        description: error.response?.data?.msg || "Please try again",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(reportId);
      const response = await axios.delete(`http://localhost:8000/api/reports/${reportId}`);
      if (response.data.msg === 'Success') {
        toast({
          title: "Report deleted",
          description: "Report has been permanently removed",
          duration: 2000
        });
        fetchReports(); // Refresh the list
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Failed to delete report",
        description: error.response?.data?.msg || "Please try again",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (reportId) => {
    // Navigate to edit report page (we'll create this route)
    navigate(`/doctor/report/edit/${reportId}`);
  };

  const handleView = (reportId) => {
    // Navigate to view report page
    navigate(`/doctor/report/view/${reportId}`);
  };

  // Filter reports based on search and status
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.assessment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && report.isPublished) ||
      (statusFilter === 'draft' && !report.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row">
        <DoctorSidenav />
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-3 overflow-x-hidden max-w-full">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mx-1 sm:mx-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Medical Reports</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Manage and publish your medical reports</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/doctor/completed-appointments')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Report
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mx-1 sm:mx-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, complaint, or diagnosis..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Reports</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-sm border mx-1 sm:mx-0">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No reports found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Create your first medical report from completed appointments'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Report Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {report.patientName || 'Unknown Patient'}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            report.isPublished 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.isPublished ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Draft
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created: {formatDate(report.createdAt)}
                          </div>
                          {report.isPublished && report.publishedAt && (
                            <div className="flex items-center">
                              <Send className="h-4 w-4 mr-1" />
                              Published: {formatDate(report.publishedAt)}
                            </div>
                          )}
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            ID: {report.appointmentId}
                          </div>
                        </div>
                        
                        {report.chiefComplaint && (
                          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                            <span className="font-medium">Chief Complaint:</span> {report.chiefComplaint}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(report._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(report._id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        {report.isPublished ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnpublish(report._id)}
                            disabled={publishingId === report._id}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {publishingId === report._id ? 'Unpublishing...' : 'Unpublish'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(report._id)}
                            disabled={publishingId === report._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {publishingId === report._id ? 'Publishing...' : 'Publish'}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(report._id)}
                          disabled={deletingId === report._id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === report._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {reports.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mx-1 sm:mx-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.isPublished).length}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reports.filter(r => !r.isPublished).length}
                  </div>
                  <div className="text-sm text-gray-600">Drafts</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
