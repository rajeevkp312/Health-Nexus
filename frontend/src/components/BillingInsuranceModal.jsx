import React from 'react';
import { X } from 'lucide-react';

export function BillingInsuranceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const insurance = [
    'We accept major insurers (cashless and reimbursement) as per your policy network list.',
    'Carry your insurance card, policy number, and a government ID for verification.',
    'Pre‑authorization is required for planned admissions and certain procedures.',
    'Coverage depends on policy terms: room rent caps, co‑pay, sub‑limits may apply.'
  ];

  const billing = [
    'Transparent, itemized bills for services, procedures, medicines, and consumables.',
    'Accepted modes: UPI, cards, net‑banking, cash (as per statutory limits).',
    'Advance deposits may be required for admissions or surgeries.',
    'Final bill settlement at discharge; soft copy available on registered email.'
  ];

  const help = [
    'For billing queries: billing@healthnexus.com | +91 98765 43210 (9 AM–7 PM).',
    'For insurance helpdesk: insurance@healthnexus.com | +91 98765 40000.',
    'Submit claims/reimbursement forms within insurer timelines with all required documents.'
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Billing & Insurance</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-5">
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Insurance Guidance</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {insurance.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Billing Information</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {billing.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Helpdesk</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {help.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
