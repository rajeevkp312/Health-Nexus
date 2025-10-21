import React from 'react';
import { X } from 'lucide-react';

export function MedicalRecordsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const access = [
    'Patients can request copies of lab reports, prescriptions, discharge summaries, and imaging on valid ID verification.',
    'Digital copies can be emailed to the registered address on request.',
    'Turnaround time for records copy: 24–72 hours depending on volume and archival retrieval.'
  ];

  const request = [
    'Submit request at Medical Records Department (MRD) or via patient portal.',
    'Carry a government ID and patient UHID/Case Number.',
    'Authorized family members need consent or legal proof for access.'
  ];

  const contact = [
    'MRD Desk: mrd@healthnexus.com | +91 98765 46600 (10 AM–6 PM).',
    'For urgent clinical needs, treating doctor can request expedited copies.'
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-5">
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Access</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {access.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">How to Request</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {request.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Contact</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {contact.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
