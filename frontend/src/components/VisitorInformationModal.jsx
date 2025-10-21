import React from 'react';
import { X } from 'lucide-react';

export function VisitorInformationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const hours = [
    'General Wards: 11:00 AM – 1:00 PM, 5:00 PM – 7:00 PM',
    'ICU/CCU: 30‑minute slots, two attendants per day (as permitted by unit)',
    'Pediatrics: One parent/guardian allowed 24x7 with attendant badge'
  ];

  const guidelines = [
    'Do not bring flowers, outside food, or latex balloons inside patient areas.',
    'Sanitize hands before and after visiting; wear mask where mandated.',
    'Maintain silence; keep phones on silent mode inside clinical zones.',
    'Children under 12 should avoid ICUs unless necessary.',
    'Do not photograph patients or staff without consent.'
  ];

  const amenities = [
    'Cafeteria: Ground floor, 8:00 AM – 10:00 PM',
    'Parking: Basement and open lot, first 30 minutes free',
    'Prayer/Quiet Room: 1st floor, near elevators',
    'Pharmacy: 24x7 near Emergency',
    'ATM: Near main lobby'
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Visitor Information</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-5">
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Visiting Hours</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {hours.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Guidelines</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {guidelines.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold text-primary mb-2">Amenities</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {amenities.map((i) => (<li key={i}>{i}</li>))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
