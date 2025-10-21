import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DoctorSidenav from './DoctorSidenav';
import MedicalReportForm from './MedicalReportForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, ArrowLeft, Printer } from 'lucide-react';

export default function DoctorCreateReport() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
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

    doctorName: '',
    doctorSpecialty: '',
    doctorLicenseNumber: '',

    // Medico-legal template party/ref fields
    instructingParty: '',
    instructingPartyAddress: '',
    instructingPartyRef: '',
    solicitorsRef: '',
    corexRef: '',
    primaryReferrer: '',
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
        // Fetch appointment
        const apRes = await axios.get(`http://localhost:8000/api/app/${appointmentId}`);
        const ap = apRes.data?.value || null;
        setAppointment(ap);

        // Derive ids
        const pid = typeof ap?.pid === 'string' ? ap.pid : ap?.pid?._id;
        const did = typeof ap?.did === 'string' ? ap.did : ap?.did?._id || doctorId;

        // Fetch patient snapshot
        let pat = null;
        if (pid) {
          try {
            const pRes = await axios.get(`http://localhost:8000/api/patient/${pid}`);
            if (pRes.data?.msg === 'Success') pat = pRes.data.value;
          } catch {}
        }
        // Fallback search by email/phone
        if (!pat && (ap?.patientEmail || ap?.patientPhone)) {
          try {
            const list = await axios.get('http://localhost:8000/api/patient');
            const all = list.data?.value || [];
            pat = all.find(x => (x.email && x.email === ap?.patientEmail) || (x.phone && x.phone === ap?.patientPhone) || (x.number && x.number === ap?.patientPhone));
          } catch {}
        }
        setPatient(pat);

        // Fetch doctor snapshot
        let docSnap = null;
        if (did) {
          try {
            const dRes = await axios.get(`http://localhost:8000/api/doctor/${did}`);
            if (dRes.data?.msg === 'Success' && dRes.data?.value) docSnap = dRes.data.value;
            if (!docSnap && dRes.data?.doctor) docSnap = dRes.data.doctor; // admin format
          } catch {}
        }
        setDoctor(docSnap);

        // Prefill form
        // Compute derived fields
        const dobStr = ap?.patientDob || pat?.dob || pat?.dateOfBirth || '';
        const age = (() => {
          if (!dobStr) return '';
          const d = new Date(dobStr);
          if (isNaN(d.getTime())) return '';
          const diff = Date.now() - d.getTime();
          return String(Math.abs(new Date(diff).getUTCFullYear() - 1970));
        })();

        setForm(prev => ({
          ...prev,
          // Facility header (use UI/doctor data if available)
          hospitalName: prev.hospitalName || 'HealthNexus Clinic',
          hospitalAddress: docSnap?.address || prev.hospitalAddress,
          hospitalPhone: docSnap?.phone || prev.hospitalPhone,

          // Header & banner
          reportTitle: prev.reportTitle || `${ap?.patientName || pat?.name || 'Sample'} Report`,

          patientName: ap?.patientName || pat?.name || '',
          patientDob: ap?.patientDob || pat?.dob || pat?.dateOfBirth || '',
          patientAge: prev.patientAge || age,
          patientGender: ap?.patientGender || pat?.gender || '',
          patientContact: ap?.patientPhone || pat?.phone || pat?.number || '',
          patientEmail: ap?.patientEmail || pat?.email || '',
          patientBloodGroup: ap?.patientBloodGroup || pat?.bloodGroup || pat?.bloodgrp || '',
          patientAddress: ap?.patientAddress || pat?.address || '',
          patientIdSnapshot: pid || '',

          doctorName: docSnap?.name || '',
          doctorSpecialty: ap?.specialty || docSnap?.spe || '',
          medicalExpert: docSnap?.name || '',
          expertQualifications: docSnap?.qualification || prev.expertQualifications,

          chiefComplaint: ap?.reason || ap?.description || '',
          // Appointment Request Form specific prefill
          preferredDate: ap?.date || '',
          preferredTime: ap?.time || ap?.slot || '',
          providerPreferred: docSnap?.name || '',
          providerSpecialty: docSnap?.spe || '',
          // Examination details
          officeAppointmentDate: prev.officeAppointmentDate || ap?.date || prev.preferredDate || '',
          // Place of examination already tied to hospitalAddress above
        }));
      } catch (e) {
        console.error('Load report data error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId, doctorId]);

  const addMedication = () => setForm(prev => ({ ...prev, medications: [...prev.medications, { name: '', dose: '', frequency: '', duration: '' }] }));
  const updateMedication = (idx, key, value) => setForm(prev => ({ ...prev, medications: prev.medications.map((m, i) => i === idx ? { ...m, [key]: value } : m) }));
  const removeMedication = (idx) => setForm(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== idx) }));

  const addPlanMedication = () => setForm(prev => ({ ...prev, medicationsPlan: [...prev.medicationsPlan, { name: '', dose: '', frequency: '', duration: '' }] }));
  const updatePlanMedication = (idx, key, value) => setForm(prev => ({ ...prev, medicationsPlan: prev.medicationsPlan.map((m, i) => i === idx ? { ...m, [key]: value } : m) }));
  const removePlanMedication = (idx) => setForm(prev => ({ ...prev, medicationsPlan: prev.medicationsPlan.filter((_, i) => i !== idx) }));

  // Prescribed medicines (separate from plan for clarity)
  const addPrescription = () => setForm(prev => ({ ...prev, prescribedMedicines: [...prev.prescribedMedicines, { name: '', dose: '', frequency: '', duration: '', instructions: '' }] }));
  const updatePrescription = (idx, key, value) => setForm(prev => ({ ...prev, prescribedMedicines: prev.prescribedMedicines.map((m, i) => i === idx ? { ...m, [key]: value } : m) }));
  const removePrescription = (idx) => setForm(prev => ({ ...prev, prescribedMedicines: prev.prescribedMedicines.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        appointmentId,
        pid: typeof appointment?.pid === 'string' ? appointment.pid : appointment?.pid?._id,
        did: typeof appointment?.did === 'string' ? appointment.did : appointment?.did?._id || doctorId,
        ...form,
      };
      const res = await axios.post('http://localhost:8000/api/reports', payload);
      if (res.data?.msg === 'Success') {
        toast({ title: 'Report saved', description: 'Medical report created successfully', duration: 2000 });
        navigate('/doctor/completed-appointments');
      } else {
        toast({ title: 'Save failed', description: res.data?.msg || 'Try again later', variant: 'destructive', duration: 2000 });
      }
    } catch (e) {
      console.error('Save report error', e);
      toast({ title: 'Network error', description: 'Please try again', variant: 'destructive', duration: 2000 });
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="flex flex-col lg:flex-row">
        <div className="print:hidden"><DoctorSidenav /></div>
        <div className="flex-1 px-2 py-1 sm:p-4 lg:p-6 pt-20 lg:pt-6 pb-16 lg:pb-6 space-y-3 overflow-x-hidden max-w-full">
          {/* Screen toolbar only */}
          <div className="print:hidden mx-1 sm:mx-0 bg-white rounded-lg shadow-sm border p-2 sm:p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="bg-emerald-100 rounded-full p-1.5"><FileText className="h-4 w-4 text-emerald-600" /></div>
              <span className="font-semibold">Medical Report</span>
              <span className="text-gray-400 text-xs">(Appointment #{appointmentId})</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)} size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button variant="outline" onClick={() => window.print()} size="sm"><Printer className="h-4 w-4 mr-1" />Print</Button>
              <Button onClick={handleSave} size="sm" disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>

          {/* Medical report form */}
          <MedicalReportForm form={form} setField={setField} appointmentId={appointmentId} />
        </div>
      </div>
    </div>
  );
}
