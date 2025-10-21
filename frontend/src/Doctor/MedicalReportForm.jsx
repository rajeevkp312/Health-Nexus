import React from 'react';
import logo2 from '../assets/logo2.png';

export default function MedicalReportForm({ form, setField, appointmentId }) {
  const addPlanMedication = () => {
    const next = [...(form.medicationsPlan || []), { name: '', dose: '', frequency: '', duration: '' }];
    setField('medicationsPlan', next);
  };
  const updatePlanMedication = (idx, key, value) => {
    const next = (form.medicationsPlan || []).map((m, i) => (i === idx ? { ...m, [key]: value } : m));
    setField('medicationsPlan', next);
  };
  const removePlanMedication = (idx) => {
    const next = (form.medicationsPlan || []).filter((_, i) => i !== idx);
    setField('medicationsPlan', next);
  };

  const setVitals = (key, value) => setField('vitals', { ...(form.vitals || {}), [key]: value });
  // Compute age from DOB if not explicitly provided
  const age = form.patientAge || (() => {
    if (!form.patientDob) return '';
    const d = new Date(form.patientDob);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    return String(Math.abs(new Date(diff).getUTCFullYear() - 1970));
  })();

  return (
    <div className="report-container mx-auto bg-white border shadow-sm print:shadow-none print:border-0">
      {/* Header - white with logo and title (matches template style) */}
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
          <div className="text-sm text-gray-700"> {form.reportTitle || (form.patientName ? `${form.patientName} Report` : 'Mr Sample Report')} prepared on {form.reportDate}</div>
        </div>
      </div>

      

      <style>{`
        @page { size: A4; margin: 12mm; }
        .report-container { width: 184mm; max-width: 100%; margin: 0 auto; box-sizing: border-box; }
        /* Ensure content fits the printable area */
        @media print {
          .page-break { break-after: page; }
          .report-container { width: 184mm; }
          /* Force colors to print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Darken all grays for print legibility */
          .text-gray-500, .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900 { color: #111827 !important; }
          /* Ensure input text is dark in print */
          .mr-input, .mr-textarea, input, textarea { color: #111827 !important; font-weight: 500 !important; }
          /* Hide placeholders in print */
          input::placeholder, textarea::placeholder { color: transparent !important; }
        }
        /* Underline-style inputs */
        input.under, textarea.under { outline: none; border: 0; border-bottom: 2px solid #9ca3af; border-radius: 0; color: #111827; }
        input.under:focus, textarea.under:focus { border-bottom-color: #6b7280; }
      `}</style>

      <div className="p-6 space-y-4">
        {/* Black banner title */}
        <div className="border-2 border-amber-500 bg-black text-white px-3 py-1.5 text-sm font-semibold print-color">
          {form.reportTitle || (form.patientName ? `${form.patientName}` : 'Mr Sample Report')}
        </div>

        {/* Utility styles for this template */}
        <style>{`
          :root { --mr-accent: #f59e0b; }
          .mr-row { display: grid; grid-template-columns: 220px 1fr; gap: 10px; align-items: center; }
          .mr-label { color: #111827; font-size: 12px; font-weight: 500; }
          .mr-input, .mr-textarea { border: 1.5px solid var(--mr-accent); padding: 6px 8px; border-radius: 2px; min-height: 30px; font-size: 13px; color: #111827 !important; font-weight: 500; background-color: #ffffff; }
          .mr-textarea { min-height: 56px; }
          /* Ensure dark text in all states */
          .mr-input:focus, .mr-textarea:focus { color: #111827 !important; }
          .mr-input::placeholder, .mr-textarea::placeholder { color: #6b7280; }
        `}</style>

        {/* 1. Administrative Information */}
        <div className="mt-2">
          <div className="font-semibold text-gray-900 mb-1">1. Patient Information</div>
          <div className="space-y-2">
            <div className="mr-row"><div className="mr-label">Patient's Name</div><input className="mr-input w-full" value={form.patientName || ''} onChange={e=>setField('patientName', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Patient's Age</div><input className="mr-input w-full" value={age || ''} onChange={e=>setField('patientAge', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Patient's Address</div><input className="mr-input w-full" value={form.patientAddress || ''} onChange={e=>setField('patientAddress', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Patient's Phone No.</div><input className="mr-input w-full" value={form.patientContact || ''} onChange={e=>setField('patientContact', e.target.value)} /></div>
          </div>
        </div>

        {/* 2. Examination Details */}
        <div className="mt-3">
          <div className="font-semibold text-gray-900 mb-1">2. Doctor Details</div>
          <div className="space-y-2">
            <div className="mr-row"><div className="mr-label">Medical Expert</div><input className="mr-input w-full" value={form.medicalExpert || form.doctorName || ''} onChange={e=>setField('medicalExpert', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Expert Qualifications</div><input className="mr-input w-full" value={form.expertQualifications || ''} onChange={e=>setField('expertQualifications', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Specialism</div><input className="mr-input w-full" value={form.doctorSpecialty || ''} onChange={e=>setField('doctorSpecialty', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Date of Examination</div><input className="mr-input w-full" value={form.officeAppointmentDate || form.preferredDate || ''} onChange={e=>setField('officeAppointmentDate', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Place of Examination</div><input className="mr-input w-full" value={form.hospitalAddress || ''} onChange={e=>setField('hospitalAddress', e.target.value)} /></div>
          </div>
        </div>

        {/* 3. Medical Findings and History */}
        <div className="mt-3">
          <div className="font-semibold text-gray-900 mb-1">3. Medical Findings and History</div>
          <div className="space-y-2">
            <div className="mr-row"><div className="mr-label">Chief Complaint</div><textarea className="mr-textarea w-full" value={form.chiefComplaint || ''} onChange={e=>setField('chiefComplaint', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">History of Present Illness (HPI)</div><textarea className="mr-textarea w-full" value={form.hpi || ''} onChange={e=>setField('hpi', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Past Medical History (PMH)</div><textarea className="mr-textarea w-full" value={form.pmh || ''} onChange={e=>setField('pmh', e.target.value)} /></div>

            <div>
              <div className="mr-label mb-1">Prescribed Medicine and Dosage (Current)</div>
              <div className="space-y-2">
                {(form.prescribedMedicines || []).map((m, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <input className="mr-input" placeholder="Medicine" value={m.name || ''} onChange={e => {
                      const next = [...(form.prescribedMedicines || [])];
                      next[i] = { ...next[i], name: e.target.value };
                      setField('prescribedMedicines', next);
                    }} />
                    <input className="mr-input" placeholder="Dose" value={m.dose || ''} onChange={e => {
                      const next = [...(form.prescribedMedicines || [])];
                      next[i] = { ...next[i], dose: e.target.value };
                      setField('prescribedMedicines', next);
                    }} />
                    <input className="mr-input" placeholder="Frequency" value={m.frequency || ''} onChange={e => {
                      const next = [...(form.prescribedMedicines || [])];
                      next[i] = { ...next[i], frequency: e.target.value };
                      setField('prescribedMedicines', next);
                    }} />
                    <input className="mr-input" placeholder="Duration" value={m.duration || ''} onChange={e => {
                      const next = [...(form.prescribedMedicines || [])];
                      next[i] = { ...next[i], duration: e.target.value };
                      setField('prescribedMedicines', next);
                    }} />
                    <button type="button" className="text-red-600 text-sm" onClick={() => {
                      const next = (form.prescribedMedicines || []).filter((_, idx) => idx !== i);
                      setField('prescribedMedicines', next);
                    }}>Remove</button>
                  </div>
                ))}
                <button type="button" className="text-blue-600 text-sm" onClick={() => setField('prescribedMedicines', [...(form.prescribedMedicines || []), { name:'', dose:'', frequency:'', duration:'' }])}>+ Add Medicine</button>
              </div>
            </div>

            <div className="mr-row"><div className="mr-label">Laboratory & Imaging Results</div><textarea className="mr-textarea w-full" value={form.labsImaging || ''} onChange={e=>setField('labsImaging', e.target.value)} /></div>
          </div>
        </div>

        {/* 4. Assessment and Management */}
        <div className="mt-3">
          <div className="font-semibold text-gray-900 mb-1">4. Assessment and Management</div>
          <div className="space-y-2">
            <div className="mr-row"><div className="mr-label">Assessment (Diagnosis/Clinical Impression)</div><textarea className="mr-textarea w-full" value={form.assessment || ''} onChange={e=>setField('assessment', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Plan</div><textarea className="mr-textarea w-full" value={form.plan || ''} onChange={e=>setField('plan', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Lifestyle Advice</div><textarea className="mr-textarea w-full" value={form.lifestyleAdvice || ''} onChange={e=>setField('lifestyleAdvice', e.target.value)} /></div>
            <div className="mr-row"><div className="mr-label">Follow-up</div><textarea className="mr-textarea w-full" value={form.followUp || ''} onChange={e=>setField('followUp', e.target.value)} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
