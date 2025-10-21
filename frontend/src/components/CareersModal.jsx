import React from 'react';
import { X } from 'lucide-react';

export function CareersModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const roles = [
    'Staff Nurse (ICU, IPD, OPD)',
    'Front Desk Executive / Patient Coordinator',
    'Lab Technician (Pathology)',
    'Radiology Technologist (X‑ray/USG/CT)',
    'Pharmacist',
    'IT Support / EMR Operator',
    'Housekeeping & Maintenance'
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Careers at HealthNexus</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          <p className="text-sm text-gray-700">
            Join our mission to deliver compassionate, high‑quality healthcare. We value clinical excellence, teamwork, and integrity.
          </p>

          <div>
            <h3 className="text-lg font-bold text-primary mb-2">Current Openings</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-2">How to Apply</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              <li>Email your resume to <span className="font-semibold">careers@healthnexus.com</span> with subject "Application – [Role]".</li>
              <li>Include availability, notice period, and expected CTC.</li>
              <li>Walk‑in submissions accepted Mon–Fri, 10 AM–4 PM at Front Desk.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
