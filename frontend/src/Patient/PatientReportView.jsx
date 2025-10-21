import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PatientSidenav from './PatientSidenav';
import logo2 from '../assets/logo2.png';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Printer, ArrowLeft } from 'lucide-react';

export default function PatientReportView() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/reports/appointment/${appointmentId}`);
        console.log('Patient Report API Response:', res.data);
        
        if (res.data?.value) {
          console.log('Report found:', res.data.value);
          console.log('Is Published:', res.data.value.isPublished);
          
          if (res.data.value.isPublished) {
            // Only show published reports to patients
            setReport(res.data.value);
          } else {
            console.log('Report exists but is not published');
            setReport(null);
          }
        } else {
          console.log('No report found for appointment:', appointmentId);
          setReport(null);
        }
      } catch (e) {
        console.error('Load report error', e);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 print:bg-white">
      <div className="flex flex-col lg:flex-row">
        <div className="print:hidden"><PatientSidenav /></div>
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-0 lg:pt-6 pb-4 lg:pb-6 space-y-3 overflow-x-hidden max-w-full print:p-0 print:pt-0">
          {/* Header */}
          <div className="print:hidden bg-white rounded-lg shadow-sm border p-2 sm:p-4 mx-1 sm:mx-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 rounded-full p-2"><FileText className="h-5 w-5 text-pink-600" /></div>
                <div>
                  <h1 className="text-base sm:text-2xl font-bold text-gray-900">Medical Report</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Appointment #{appointmentId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(-1)} size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                {report && (
                  <>
                    <Button variant="outline" onClick={handlePrint} size="sm"><Printer className="h-4 w-4 mr-1" />Print</Button>
                    <Button onClick={handlePrint} size="sm"><Download className="h-4 w-4 mr-1" />Download</Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {!report ? (
            <div className="print:hidden bg-white rounded-xl shadow-sm border p-8 text-center mx-1 sm:mx-0">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No report available yet</h3>
              <p className="text-gray-600 mb-4">Your doctor hasn't published a medical report for this appointment yet.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">What does this mean?</p>
                <p>Your doctor may have created a report but needs to publish it before you can view it. Please contact your doctor if you believe this report should be available.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mx-1 sm:mx-0 space-y-6 print:p-0 print:mx-0 print:shadow-none print:border-0 print:rounded-none">
              {/* Facility header with brand */}
              <div className="border-b pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 ring-1 ring-emerald-200 overflow-hidden flex items-center justify-center">
                      <img
                        src={logo2}
                        alt="Health Nexus Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{report.hospitalName || 'HealthNexus Clinic'}</h2>
                      <p className="text-sm text-gray-600">{report.hospitalAddress || '—'}</p>
                      <p className="text-sm text-gray-600">{report.hospitalPhone || '—'}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div><span className="font-medium">Date:</span> {new Date(report.reportDate || report.createdAt).toLocaleDateString('en-GB')}</div>
                    <div><span className="font-medium">Report ID:</span> {report._id}</div>
                  </div>
                </div>
              </div>

              {/* 1. Patient Information */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Patient Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-sm text-dark"><span className="font-medium">Patient's Name:</span> {report.patientName || '—'}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Patient's Age:</span> {report.patientAge || (report.patientDob ? (() => {
                      const d = new Date(report.patientDob);
                      if (isNaN(d.getTime())) return '—';
                      const diff = Date.now() - d.getTime();
                      return String(Math.abs(new Date(diff).getUTCFullYear() - 1970));
                    })() : '—')}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Patient's Address:</span> {report.patientAddress || '—'}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Patient's Phone No.:</span> {report.patientContact || '—'}</div>
                  </div>
                </div>

                {/* 2. Doctor Details */}
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Doctor Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-sm text-dark"><span className="font-medium">Medical Expert:</span> {report.medicalExpert || report.doctorName || '—'}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Expert Qualifications:</span> {report.expertQualifications || '—'}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Specialism:</span> {report.doctorSpecialty || '—'}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Date of Examination:</span> {report.officeAppointmentDate || report.preferredDate || '—'}</div>
                    <div className="text-sm text-dark"><span className="font-medium">Place of Examination:</span> {report.hospitalAddress || '—'}</div>
                  </div>
                </div>
              </div>

              {/* 3. Medical Findings and History */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Medical Findings and History</h3>
                  <div className="space-y-3">
                    <Section title="Chief Complaint" value={report.chiefComplaint} />
                    <Section title="History of Present Illness (HPI)" value={report.hpi} />
                    <Section title="Past Medical History (PMH)" value={report.pmh} />
                    <Section title="Prescribed Medicine and Dosage (Current)">
                      {Array.isArray(report.prescribedMedicines) && report.prescribedMedicines.length > 0 ? (
                        <ul className="list-disc ml-6 text-sm text-gray-800 space-y-1">
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
                              <li key={i}>{formatMedicine(m)}</li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">—</p>
                      )}
                    </Section>
                    <Section title="Laboratory & Imaging Results" value={report.labsImaging} />
                  </div>
                </div>
              </div>

              {/* 4. Assessment and Management */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Assessment and Management</h3>
                  <div className="space-y-3">
                    <Section title="Assessment (Diagnosis/Clinical Impression)" value={report.assessment} />
                    <Section title="Plan" value={report.plan} />
                    <Section title="Lifestyle Advice" value={report.lifestyleAdvice} />
                    <Section title="Follow-up" value={report.followUp} />
                  </div>
                </div>
              </div>

              {/* Additional Clinical Details (Collapsed) */}
              <div className="space-y-4 border-t pt-4">
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600">Additional Clinical Details</summary>
                  <div className="mt-3 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Physical Examination</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-sm mb-3">
                        <div><span className="font-medium">Temp:</span> {report.vitals?.temp || '—'}</div>
                        <div><span className="font-medium">BP:</span> {report.vitals?.bp || '—'}</div>
                        <div><span className="font-medium">HR:</span> {report.vitals?.hr || '—'}</div>
                        <div><span className="font-medium">RR:</span> {report.vitals?.rr || '—'}</div>
                        <div><span className="font-medium">SpO2:</span> {report.vitals?.spo2 || '—'}</div>
                      </div>
                      <div className="space-y-2">
                        <GridTwo label="General Appearance" value={report.generalAppearance} />
                        <GridTwo label="HEENT" value={report.heent} />
                        <GridTwo label="Cardiovascular" value={report.cardiovascular} />
                        <GridTwo label="Respiratory" value={report.respiratory} />
                        <GridTwo label="Neurological" value={report.neurological} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Section title="Allergies" value={report.allergies} />
                      <Section title="Family History" value={report.familyHistory} />
                      <Section title="Social History" value={report.socialHistory} />
                      <Section title="Investigations" value={report.investigations} />
                      <Section title="Referrals" value={report.referrals} />
                    </div>
                  </div>
                </details>
              </div>

              <div className="pt-4 border-t text-sm text-gray-800">
                <div><span className="font-medium">Doctor's Signature:</span> {report.doctorSignature || '—'}</div>
                <div><span className="font-medium">Date:</span> {report.signatureDate || new Date(report.createdAt).toLocaleDateString('en-GB')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, value, children }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {children ? children : (
        <p className="text-sm text-gray-800 whitespace-pre-line">{value || '—'}</p>
      )}
    </div>
  );
}

function GridTwo({ label, value }) {
  return (
    <div className="grid grid-cols-1">
      <div className="text-sm text-gray-800"><span className="font-medium">{label}:</span> {value || '—'}</div>
    </div>
  );
}
