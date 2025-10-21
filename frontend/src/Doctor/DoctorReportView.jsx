import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Edit, ArrowLeft, Printer, Send, XCircle } from 'lucide-react';
import logo2 from '../assets/logo2.png';

export default function DoctorReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/reports/${reportId}`);
        if (res.data?.value) {
          setReport(res.data.value);
        } else {
          setReport(null);
        }
      } catch (e) {
        console.error('Load report error', e);
        setReport(null);
        toast({
          title: "Error loading report",
          description: "Report not found or access denied",
          variant: "destructive",
          duration: 2000
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reportId]);

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

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const response = await axios.put(`http://localhost:8000/api/reports/${reportId}/publish`);
      if (response.data.msg.includes('successfully')) {
        toast({
          title: "Report published",
          description: "Patient can now view this report",
          duration: 2000
        });
        setReport(prev => ({ ...prev, isPublished: true, publishedAt: new Date() }));
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
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      const response = await axios.put(`http://localhost:8000/api/reports/${reportId}/unpublish`);
      if (response.data.msg.includes('successfully')) {
        toast({
          title: "Report unpublished",
          description: "Report is now hidden from patient",
          duration: 2000
        });
        setReport(prev => ({ ...prev, isPublished: false, publishedAt: null }));
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
      setPublishing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col lg:flex-row">
          <DoctorSidenav />
          <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-3 overflow-x-hidden max-w-full">
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center mx-1 sm:mx-0">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Report not found</h3>
              <p className="text-gray-600">The requested report could not be found or you don't have access to it.</p>
              <Button onClick={() => navigate('/doctor/reports')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compute age from DOB if available
  const age = report.patientAge || (() => {
    if (!report.patientDob) return '';
    const d = new Date(report.patientDob);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    return String(Math.abs(new Date(diff).getUTCFullYear() - 1970));
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row">
        <div className="print:hidden"><DoctorSidenav /></div>
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-3 overflow-x-hidden max-w-full">
          
          {/* Screen toolbar only */}
          <div className="print:hidden mx-1 sm:mx-0 bg-white rounded-lg shadow-sm border p-2 sm:p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="bg-blue-100 rounded-full p-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-semibold">View Medical Report</span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                report.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {report.isPublished ? 'Published' : 'Draft'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/doctor/reports')} size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />Back
              </Button>
              <Button variant="outline" onClick={() => navigate(`/doctor/report/edit/${reportId}`)} size="sm">
                <Edit className="h-4 w-4 mr-1" />Edit
              </Button>
              <Button variant="outline" onClick={handlePrint} size="sm">
                <Printer className="h-4 w-4 mr-1" />Print
              </Button>
              {report.isPublished ? (
                <Button 
                  variant="outline" 
                  onClick={handleUnpublish} 
                  size="sm" 
                  disabled={publishing}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {publishing ? 'Unpublishing...' : 'Unpublish'}
                </Button>
              ) : (
                <Button 
                  onClick={handlePublish} 
                  size="sm" 
                  disabled={publishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {publishing ? 'Publishing...' : 'Publish'}
                </Button>
              )}
            </div>
          </div>

          {/* Report Content */}
          <div className="report-container mx-auto bg-white border shadow-sm print:shadow-none print:border-0">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full ring-1 ring-gray-300 overflow-hidden flex items-center justify-center">
                <img
                  src={logo2}
                  alt="Health Nexus Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">Health Nexus</div>
                <div className="text-sm text-gray-700">
                  {report.reportTitle || (report.patientName ? `${report.patientName} Report` : 'Medical Report')} prepared on {new Date(report.reportDate || report.createdAt).toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>

            <style>{`
              @page { size: A4; margin: 12mm; }
              .report-container { width: 184mm; max-width: 100%; margin: 0 auto; box-sizing: border-box; }
              @media print {
                .page-break { break-after: page; }
                .report-container { width: 184mm; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .text-gray-500, .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900 { color: #111827 !important; }
                input::placeholder, textarea::placeholder { color: transparent !important; }
              }
            `}</style>

            <div className="p-6 space-y-4">
              {/* Black banner title */}
              <div className="border-2 border-amber-500 bg-black text-white px-3 py-1.5 text-sm font-semibold print-color">
                {report.reportTitle || (report.patientName ? `${report.patientName}` : 'Medical Report')}
              </div>

              {/* 1. Patient Information */}
              <div className="mt-2">
                <div className="font-semibold text-gray-900 mb-1">1. Patient Information</div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Patient's Name</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.patientName || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Patient's Age</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{age || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Patient's Address</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.patientAddress || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Patient's Phone No.</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.patientContact || '—'}</div>
                  </div>
                </div>
              </div>

              {/* 2. Doctor Details */}
              <div className="mt-3">
                <div className="font-semibold text-gray-900 mb-1">2. Doctor Details</div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Medical Expert</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.medicalExpert || report.doctorName || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Expert Qualifications</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.expertQualifications || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Specialism</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.doctorSpecialty || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Date of Examination</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.officeAppointmentDate || report.preferredDate || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-xs text-gray-700">Place of Examination</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm">{report.hospitalAddress || '—'}</div>
                  </div>
                </div>
              </div>

              {/* 3. Medical Findings and History */}
              <div className="mt-3">
                <div className="font-semibold text-gray-900 mb-1">3. Medical Findings and History</div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Chief Complaint</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.chiefComplaint || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">History of Present Illness (HPI)</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.hpi || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Past Medical History (PMH)</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.pmh || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Prescribed Medicine and Dosage (Current)</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">
                      {Array.isArray(report.prescribedMedicines) && report.prescribedMedicines.length > 0 ? (
                        <ul className="list-disc ml-4 space-y-1">
                          {report.prescribedMedicines.map((m, i) => {
                            const formatMedicine = (medicine) => {
                              let result = medicine.name || 'Medicine';
                              
                              if (medicine.dose) {
                                result += ` - Take ${medicine.dose} tablet${medicine.dose !== '1' ? 's' : ''}`;
                              }
                              
                              if (medicine.frequency) {
                                const freq = medicine.frequency.toLowerCase();
                                if (freq === '1' || freq === 'once') {
                                  result += ' once daily';
                                } else if (freq === '2' || freq === 'twice') {
                                  result += ' twice daily';
                                } else if (freq === '3' || freq === 'thrice') {
                                  result += ' three times daily';
                                } else if (freq === '4') {
                                  result += ' four times daily';
                                } else if (freq !== 'na' && freq !== 'n/a') {
                                  result += ` ${freq} times daily`;
                                }
                              }
                              
                              if (medicine.duration && medicine.duration !== 'na' && medicine.duration !== 'n/a') {
                                const dur = medicine.duration.toLowerCase();
                                if (dur.includes('day')) {
                                  result += ` for ${medicine.duration}`;
                                } else if (dur.includes('week')) {
                                  result += ` for ${medicine.duration}`;
                                } else if (dur.includes('month')) {
                                  result += ` for ${medicine.duration}`;
                                } else {
                                  result += ` for ${medicine.duration} days`;
                                }
                              }
                              
                              return result;
                            };
                            
                            return (
                              <li key={i} className="text-gray-800">{formatMedicine(m)}</li>
                            );
                          })}
                        </ul>
                      ) : '—'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Laboratory & Imaging Results</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.labsImaging || '—'}</div>
                  </div>
                </div>
              </div>

              {/* 4. Assessment and Management */}
              <div className="mt-3">
                <div className="font-semibold text-gray-900 mb-1">4. Assessment and Management</div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Assessment (Diagnosis/Clinical Impression)</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.assessment || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Plan</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.plan || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Lifestyle Advice</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.lifestyleAdvice || '—'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xs text-gray-700">Follow-up</div>
                    <div className="col-span-3 border border-amber-500 text-dark px-2 py-1 text-sm min-h-[40px]">{report.followUp || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
