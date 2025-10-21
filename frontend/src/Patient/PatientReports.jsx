import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientSidenav from './PatientSidenav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Eye, 
  Download, 
  Search,
  Calendar,
  User,
  CheckCircle
} from 'lucide-react';

export default function PatientReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const patientId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const patient = JSON.parse(localStorage.getItem('patient') || '{}');
    return user.id || patient._id || patient.id;
  }, []);

  useEffect(() => {
    fetchReports();
  }, [patientId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/reports/patient/${patientId}/published`);
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

  const handleView = (appointmentId) => {
    navigate(`/patient/report/${appointmentId}`);
  };

  const handleDownload = (report) => {
    // Create a simple download by opening print dialog
    const printWindow = window.open(`/patient/report/${report.appointmentId}`, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
    }
  };

  // Filter reports based on search
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.assessment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="flex flex-col lg:flex-row">
        <PatientSidenav />
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-16 lg:pt-6 pb-4 lg:pb-6 space-y-3 overflow-x-hidden max-w-full">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center space-x-3">
              <div className="bg-pink-100 rounded-full p-2">
                <FileText className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">My Medical Reports</h1>
                <p className="text-xs sm:text-sm text-gray-600">View and download your published medical reports</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mx-1 sm:mx-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name, complaint, or diagnosis..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-sm border mx-1 sm:mx-0">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No reports available</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'No reports match your search criteria' 
                    : 'Your doctor hasn\'t published any medical reports yet'
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
                            Medical Report
                          </h3>
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Dr. {report.doctorName || report.medicalExpert || 'Unknown'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(report.publishedAt || report.createdAt)}
                          </div>
                        </div>
                        
                        {report.chiefComplaint && (
                          <p className="text-sm text-gray-700 line-clamp-2">
                            <span className="font-medium">Chief Complaint:</span> {report.chiefComplaint}
                          </p>
                        )}
                        
                        {report.assessment && (
                          <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                            <span className="font-medium">Assessment:</span> {report.assessment}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(report.appointmentId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleDownload(report)}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
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
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{reports.length}</div>
                <div className="text-sm text-gray-600">Published Medical Reports</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
