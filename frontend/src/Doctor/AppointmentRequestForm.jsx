import React from 'react';

export default function AppointmentRequestForm({ form, setField, appointment }) {
  return (
    <div className="mx-auto w-full sm:w-[794px] bg-white border shadow-sm print:shadow-none print:border-0">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/30 overflow-hidden flex items-center justify-center">
            <img
              src="/healthnexus-logo.png"
              alt="HealthNexus Logo"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="text-2xl font-semibold -mt-0.5">Medical Report</div>
        </div>
        <div className="text-right text-sm leading-5 max-w-xs ml-6">
          <div className="font-semibold">{form.hospitalName || 'HealthNexus Clinic'}</div>
          <div className="whitespace-pre-wrap break-words">{form.hospitalAddress || '123 Health Street, Wellness City'}</div>
          { (form.hospitalPhone) ? <div>{form.hospitalPhone}</div> : null }
        </div>
      </div>
      <div className="h-1 bg-emerald-600" />

      {/* Page break */}
      <div className="page-break" />

      {/* Header - Page 3 */}
      <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/30 overflow-hidden flex items-center justify-center">
            <img src="/healthnexus-logo.png" alt="HealthNexus Logo" className="w-full h-full object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
          </div>
          <div className="text-2xl font-semibold -mt-0.5">Medical Report</div>
        </div>
        <div className="text-right text-sm leading-5 max-w-xs ml-6">
          <div className="font-semibold">{form.hospitalName || 'HealthNexus Clinic'}</div>
          <div className="whitespace-pre-wrap break-words">{form.hospitalAddress || '123 Health Street, Wellness City'}</div>
          { (form.hospitalPhone) ? <div>{form.hospitalPhone}</div> : null }
        </div>
      </div>
      <div className="h-1 bg-emerald-600" />

      {/* Page 3 - Older medical fields */}
      <div className="p-6 space-y-8">
        {/* Chief Complaint */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Chief Complaint</div>
          <textarea className="under w-full h-20" value={form.chiefComplaint || ''} onChange={e=>setField('chiefComplaint', e.target.value)} />
        </section>

        {/* HPI & PMH */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">History of Present Illness (HPI)</div>
            <textarea className="under w-full h-28" value={form.hpi || ''} onChange={e=>setField('hpi', e.target.value)} />
          </div>
          <div>
            <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Past Medical History (PMH)</div>
            <textarea className="under w-full h-28" value={form.pmh || ''} onChange={e=>setField('pmh', e.target.value)} />
          </div>
        </section>

        {/* Allergies */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Allergies</div>
          <textarea className="under w-full h-16" value={form.allergies || ''} onChange={e=>setField('allergies', e.target.value)} />
        </section>

        {/* Vitals */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Vitals</div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input className="under py-1" placeholder="Temp" value={form?.vitals?.temp || ''} onChange={e=>setField('vitals', { ...(form?.vitals||{}), temp: e.target.value })} />
            <input className="under py-1" placeholder="BP" value={form?.vitals?.bp || ''} onChange={e=>setField('vitals', { ...(form?.vitals||{}), bp: e.target.value })} />
            <input className="under py-1" placeholder="HR" value={form?.vitals?.hr || ''} onChange={e=>setField('vitals', { ...(form?.vitals||{}), hr: e.target.value })} />
            <input className="under py-1" placeholder="RR" value={form?.vitals?.rr || ''} onChange={e=>setField('vitals', { ...(form?.vitals||{}), rr: e.target.value })} />
            <input className="under py-1" placeholder="SpO2" value={form?.vitals?.spo2 || ''} onChange={e=>setField('vitals', { ...(form?.vitals||{}), spo2: e.target.value })} />
          </div>
        </section>

        {/* Systems */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">General Appearance</div>
              <textarea className="under w-full h-16" value={form.generalAppearance || ''} onChange={e=>setField('generalAppearance', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">HEENT</div>
              <textarea className="under w-full h-16" value={form.heent || ''} onChange={e=>setField('heent', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Neck</div>
              <textarea className="under w-full h-16" value={form.neck || ''} onChange={e=>setField('neck', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Cardiovascular</div>
              <textarea className="under w-full h-16" value={form.cardiovascular || ''} onChange={e=>setField('cardiovascular', e.target.value)} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Respiratory</div>
              <textarea className="under w-full h-16" value={form.respiratory || ''} onChange={e=>setField('respiratory', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Abdomen</div>
              <textarea className="under w-full h-16" value={form.abdomen || ''} onChange={e=>setField('abdomen', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Musculoskeletal</div>
              <textarea className="under w-full h-16" value={form.musculoskeletal || ''} onChange={e=>setField('musculoskeletal', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Neurological</div>
              <textarea className="under w-full h-16" value={form.neurological || ''} onChange={e=>setField('neurological', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Dermatological</div>
              <textarea className="under w-full h-16" value={form.dermatological || ''} onChange={e=>setField('dermatological', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Labs & Plan */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Labs / Imaging</div>
            <textarea className="under w-full h-24" value={form.labsImaging || ''} onChange={e=>setField('labsImaging', e.target.value)} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Assessment</div>
              <textarea className="under w-full h-20" value={form.assessment || ''} onChange={e=>setField('assessment', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Plan</div>
              <textarea className="under w-full h-20" value={form.plan || ''} onChange={e=>setField('plan', e.target.value)} />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Investigations</div>
              <textarea className="under w-full h-16" value={form.investigations || ''} onChange={e=>setField('investigations', e.target.value)} />
            </div>
          </div>
        </section>
      </div>
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .page-break { break-after: page; }
        }
        input.under, textarea.under { outline: none; border: 0; border-bottom: 2px solid #d1d5db; border-radius: 0; }
        input.under:focus, textarea.under:focus { border-bottom-color: #6b7280; }
      `}</style>

      <div className="p-6 space-y-8">
        {/* Patient Information */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-4">Patient Information</div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-28 text-gray-700 text-sm">Name</span>
              <input className="flex-1 under py-1" value={form.patientName} onChange={e=>setField('patientName', e.target.value)} />
            </div>
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6 flex items-center gap-3">
                <span className="w-28 text-gray-700 text-sm">Date Of Birth</span>
                <input className="flex-1 under py-1" value={form.patientDob} onChange={e=>setField('patientDob', e.target.value)} />
              </div>
              <div className="col-span-6 flex items-center gap-4">
                <span className="text-gray-700 text-sm">Gender</span>
                {['Male','Female','Other'].map(g => (
                  <label key={g} className="flex items-center gap-2 text-sm text-gray-700"><input type="radio" name="gender" value={g} checked={form.patientGender===g} onChange={e=>setField('patientGender', e.target.value)} /> {g}</label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6 flex items-center gap-3">
                <span className="w-28 text-gray-700 text-sm">Phone Number</span>
                <input className="flex-1 under py-1" value={form.patientContact} onChange={e=>setField('patientContact', e.target.value)} />
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <span className="w-20 text-gray-700 text-sm">Email</span>
                <input className="flex-1 under py-1" value={form.patientEmail} onChange={e=>setField('patientEmail', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-28 text-gray-700 text-sm">Address</span>
              <input className="flex-1 under py-1" value={form.patientAddress} onChange={e=>setField('patientAddress', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Appointment Details */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-4">Appointment Details</div>
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-28 text-gray-700 text-sm">Preferred Date</span>
              <input className="flex-1 under py-1" value={form.preferredDate} onChange={e=>setField('preferredDate', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-28 text-gray-700 text-sm">Alternate Date</span>
              <input className="flex-1 under py-1" value={form.alternateDate} onChange={e=>setField('alternateDate', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-28 text-gray-700 text-sm">Preferred Time</span>
              <input className="flex-1 under py-1" value={form.preferredTime} onChange={e=>setField('preferredTime', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-28 text-gray-700 text-sm">Alternate Time</span>
              <input className="flex-1 under py-1" value={form.alternateTime} onChange={e=>setField('alternateTime', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Type of Appointment */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Type of Appointment</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-800">
            {['New Patient','Follow-up','Routine Check-up'].map(opt => (
              <label key={opt} className="flex items-center gap-2"><input type="radio" name="apptType" value={opt} checked={form.appointmentType===opt} onChange={e=>setField('appointmentType', e.target.value)} /> {opt}</label>
            ))}
            {['Specialist Consultation','Urgent Care'].map(opt => (
              <label key={opt} className="flex items-center gap-2"><input type="radio" name="apptType" value={opt} checked={form.appointmentType===opt} onChange={e=>setField('appointmentType', e.target.value)} /> {opt}</label>
            ))}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2"><input type="radio" name="apptType" value="Other" checked={form.appointmentType==='Other'} onChange={e=>setField('appointmentType', e.target.value)} /> Other:</label>
              <input className="flex-1 under py-0.5" value={form.appointmentTypeOther} onChange={e=>setField('appointmentTypeOther', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Reason for Appointment */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Reason for Appointment</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-800">
            {['Annual Physical Exam','Chronic Condition Management','Acute Illness or Injury'].map(opt => (
              <label key={opt} className="flex items-center gap-2"><input type="radio" name="reason" value={opt} checked={form.reason===opt} onChange={e=>setField('reason', e.target.value)} /> {opt}</label>
            ))}
            {['Prescription Refill','Test Results Review'].map(opt => (
              <label key={opt} className="flex items-center gap-2"><input type="radio" name="reason" value={opt} checked={form.reason===opt} onChange={e=>setField('reason', e.target.value)} /> {opt}</label>
            ))}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2"><input type="radio" name="reason" value="Other" checked={form.reason==='Other'} onChange={e=>setField('reason', e.target.value)} /> Other:</label>
              <input className="flex-1 under py-0.5" value={form.reasonOther} onChange={e=>setField('reasonOther', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Healthcare Provider */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Healthcare Provider</div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">• Preferred Provider</span>
              <input className="flex-1 under py-0.5" value={form.providerPreferred} onChange={e=>setField('providerPreferred', e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">• Specialty</span>
              <input className="flex-1 under py-0.5" value={form.providerSpecialty} onChange={e=>setField('providerSpecialty', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Coverage */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-2">Coverage</div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm text-gray-700">Provider</span>
              <input className="flex-1 under py-0.5" value={form.coverageProvider} onChange={e=>setField('coverageProvider', e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm text-gray-700">Number</span>
              <input className="flex-1 under py-0.5" value={form.coverageNumber} onChange={e=>setField('coverageNumber', e.target.value)} />
            </div>
          </div>
        </section>
      </div>

      {/* Page break */}
      <div className="page-break" />

      {/* Header - Page 2 */}
      <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/30 overflow-hidden flex items-center justify-center">
            <img src="/healthnexus-logo.png" alt="HealthNexus Logo" className="w-full h-full object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
          </div>
          <div className="text-2xl font-semibold -mt-0.5">Medical Report</div>
        </div>
        <div className="text-right text-sm leading-5 max-w-xs ml-6">
          <div className="font-semibold">{form.hospitalName || 'HealthNexus Clinic'}</div>
          <div className="whitespace-pre-wrap break-words">{form.hospitalAddress || '123 Health Street, Wellness City'}</div>
          { (form.hospitalPhone) ? <div>{form.hospitalPhone}</div> : null }
        </div>
      </div>
      <div className="h-1 bg-emerald-600" />

      {/* Page 2 */}
      <div className="p-6 space-y-8">
        {/* Additional Information */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-4">Additional Information</div>
          <p className="text-sm text-gray-700 mb-2">Please provide any additional information or special requests below.</p>
          <div className="space-y-4">
            <div className="h-6 border-b border-gray-300" />
            <div className="h-6 border-b border-gray-300" />
            <div className="h-6 border-b border-gray-300" />
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-4">Emergency Contact Information</div>
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-20 text-sm text-gray-700">Name</span>
              <input className="flex-1 under py-0.5" value={form.emName} onChange={e=>setField('emName', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-24 text-sm text-gray-700">Relationship</span>
              <input className="flex-1 under py-0.5" value={form.emRelationship} onChange={e=>setField('emRelationship', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-28 text-sm text-gray-700">Phone Number</span>
              <input className="flex-1 under py-0.5" value={form.emPhone} onChange={e=>setField('emPhone', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-16 text-sm text-gray-700">Email</span>
              <input className="flex-1 under py-0.5" value={form.emEmail} onChange={e=>setField('emEmail', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Consent */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-4">Consent</div>
          <p className="text-sm text-gray-700 leading-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nec purus dapibus, accumsan lorem eu, sagittis erat. Nam mattis diam orci. Duis venenatis sapien ut placerat sagittis. Maecenas at nisl luctus, blandit diam ut, mattis lorem. Aliquam tortor nisi, malesuada nec imperdiet non, malesuada eu metus. Nunc consequat auctor sapien, sit amet tristique ex tempor vel. Etiam in hendrerit ante.</p>
          <div className="grid grid-cols-12 gap-4 mt-10">
            <div className="col-span-6">
              <div className="h-0.5 bg-gray-300" />
              <div className="text-sm font-semibold text-gray-800 mt-1">Patient’s Signature</div>
            </div>
            <div className="col-span-6">
              <div className="h-0.5 bg-gray-300" />
              <div className="text-sm font-semibold text-gray-800 mt-1">Date</div>
            </div>
          </div>
        </section>

        {/* Office Use Only */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full border-2 border-gray-300 text-gray-800 font-semibold text-sm mb-4">Office Use Only</div>
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-32 text-sm text-gray-700">Appointment Date</span>
              <input className="flex-1 under py-0.5" value={form.officeAppointmentDate} onChange={e=>setField('officeAppointmentDate', e.target.value)} />
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <span className="w-32 text-sm text-gray-700">Appointment Time</span>
              <input className="flex-1 under py-0.5" value={form.officeAppointmentTime} onChange={e=>setField('officeAppointmentTime', e.target.value)} />
            </div>
            <div className="col-span-12 flex items-center gap-3">
              <span className="w-16 text-sm text-gray-700">Provider:</span>
              <input className="flex-1 under py-0.5" value={form.officeProvider} onChange={e=>setField('officeProvider', e.target.value)} />
            </div>
            <div className="col-span-12 flex items-center gap-6 text-sm text-gray-800">
              <span>Confirmation</span>
              <label className="flex items-center gap-2"><input type="radio" name="officeConfirmation" value="Yes" checked={form.officeConfirmation==='Yes'} onChange={e=>setField('officeConfirmation', e.target.value)} /> Yes</label>
              <label className="flex items-center gap-2"><input type="radio" name="officeConfirmation" value="No" checked={form.officeConfirmation==='No'} onChange={e=>setField('officeConfirmation', e.target.value)} /> No</label>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-900 mb-1">Notes</div>
            <div className="space-y-4">
              <div className="h-6 border-b border-gray-300" />
              <div className="h-6 border-b border-gray-300" />
              <div className="h-6 border-b border-gray-300" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
