import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';
import MedicalReportForm from './MedicalReportForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, ArrowLeft, Printer } from 'lucide-react';

export default function DoctorEditReport() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hospitalName: 'HealthNexus Clinic',
    hospitalAddress: '123 Health Street, Wellness City',
    hospitalPhone: '+91 00000 00000',
    reportDate: new Date().toISOString().slice(0, 10),

    // Template header fields
    preparedFor: 'The Court',
    reportTitle: '',

    patientName: '',
    patientDob: '',
    patientGender: '',
    patientIdSnapshot: '',
    patientContact: '',
    patientEmail: '',
    patientAddress: '',
    patientAge: '',

    doctorName: '',
    doctorSpecialty: '',
    doctorLicenseNumber: '',

    // New fields for our structure
    medicalExpert: '',
    expertQualifications: 'N/A',

    chiefComplaint: '',
    hpi: '',
    pmh: '',
    medications: [],
    allergies: '',
    familyHistory: '',
    socialHistory: '',
    ros: '',

    generalAppearance: '',
    vitals: { temp: '', bp: '', hr: '', rr: '', spo2: '' },
    heent: '',
    neck: '',
    cardiovascular: '',
    respiratory: '',
    abdomen: '',
    musculoskeletal: '',
    neurological: '',
    dermatological: '',

    labsImaging: '',
    assessment: '',
    plan: '',
    investigations: '',
    medicationsPlan: [],
    prescribedMedicines: [],
    referrals: '',
    lifestyleAdvice: '',
    followUp: '',

    doctorSignature: '',
    signatureDate: new Date().toISOString().slice(0, 10),
    
    // Appointment Request Form specific fields
    preferredDate: '',
    alternateDate: '',
    preferredTime: '',
    alternateTime: '',
    appointmentType: '',
    appointmentTypeOther: '',
    reason: '',
    reasonOther: '',
    providerPreferred: '',
    providerSpecialty: '',
    coverageProvider: '',
    coverageNumber: '',
    additionalInfo: '',
    emName: '',
    emRelationship: '',
    emPhone: '',
    emEmail: '',
    officeAppointmentDate: '',
    officeAppointmentTime: '',
    officeProvider: '',
    officeConfirmation: '',
    officeNotes: ''
  });

  const doctorId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doc = JSON.parse(localStorage.getItem('doctor') || '{}');
    return doc._id || user.id;
  }, []);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const setVitals = (key, value) => setForm(prev => ({ ...prev, vitals: { ...prev.vitals, [key]: value } }));

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/reports/${reportId}`);
        if (res.data?.value) {
          const report = res.data.value;
          // Populate form with existing report data
          setForm(prev => ({
            ...prev,
            ...report,
            // Ensure arrays are properly handled
            medications: Array.isArray(report.medications) ? report.medications : [],
            medicationsPlan: Array.isArray(report.medicationsPlan) ? report.medicationsPlan : [],
            prescribedMedicines: Array.isArray(report.prescribedMedicines) ? report.prescribedMedicines : [],
            // Ensure vitals object is properly handled
            vitals: report.vitals || { temp: '', bp: '', hr: '', rr: '', spo2: '' },
            // Format dates properly
            reportDate: report.reportDate ? new Date(report.reportDate).toISOString().slice(0, 10) : prev.reportDate,
            signatureDate: report.signatureDate || prev.signatureDate
          }));
        } else {
          toast({
            title: "Report not found",
            description: "The requested report could not be found",
            variant: "destructive",
            duration: 2000
          });
          navigate('/doctor/reports');
        }
      } catch (e) {
        console.error('Load report error', e);
        toast({
          title: "Error loading report",
          description: "Please try again later",
          variant: "destructive",
          duration: 2000
        });
        navigate('/doctor/reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reportId, navigate, toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put(`http://localhost:8000/api/reports/${reportId}`, form);
      if (res.data?.msg === 'Success') {
        toast({ 
          title: 'Report updated', 
          description: 'Medical report updated successfully', 
          duration: 2000 
        });
        navigate('/doctor/reports');
      } else {
        toast({ 
          title: 'Update failed', 
          description: res.data?.msg || 'Try again later', 
          variant: 'destructive', 
          duration: 2000 
        });
      }
    } catch (e) {
      console.error('Update report error', e);
      toast({ 
        title: 'Network error', 
        description: 'Please try again', 
        variant: 'destructive', 
        duration: 2000 
      });
    } finally {
      setSaving(false);
    }
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
        <div className="print:hidden"><DoctorSidenav /></div>
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-4 lg:pb-6 space-y-3 overflow-x-hidden max-w-full">
          {/* Screen toolbar only */}
          <div className="print:hidden mx-1 sm:mx-0 bg-white rounded-lg shadow-sm border p-2 sm:p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="bg-blue-100 rounded-full p-1.5"><FileText className="h-4 w-4 text-blue-600" /></div>
              <span className="font-semibold">Edit Medical Report</span>
              <span className="text-gray-400 text-xs">(Report ID: {reportId})</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/doctor/reports')} size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />Back
              </Button>
              <Button variant="outline" onClick={() => window.print()} size="sm">
                <Printer className="h-4 w-4 mr-1" />Print
              </Button>
              <Button onClick={handleSave} size="sm" disabled={saving}>
                <Save className="h-4 w-4 mr-1" />{saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Medical report form */}
          <MedicalReportForm form={form} setField={setField} reportId={reportId} />
        </div>
      </div>
    </div>
  );
}
