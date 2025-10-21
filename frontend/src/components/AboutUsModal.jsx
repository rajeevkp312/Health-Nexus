import React from 'react';
import { X } from 'lucide-react';

export function AboutUsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">About Us</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Who we are</h3>
              <p className="text-gray-800 mb-4">
                HealthNexus is a multi‑specialty healthcare network focused on safe, ethical, and patient‑centered care.
                We bring together experienced clinicians, modern facilities, and digital tools to deliver high‑quality outcomes.
              </p>

              <h3 className="text-lg font-bold text-primary mb-2">Our mission</h3>
              <p className="text-gray-800 mb-4">
                To make advanced, compassionate healthcare accessible and transparent, so every patient can make informed
                decisions and receive timely care.
              </p>

              <h3 className="text-lg font-bold text-primary mb-2">At a glance</h3>
              <ul className="list-disc pl-5 text-gray-800 space-y-1">
                <li>20+ clinical specialties</li>
                <li>Experienced consultant doctors and nursing teams</li>
                <li>24×7 Emergency & Critical Care</li>
                <li>Day‑care procedures and elective surgeries</li>
                <li>Integrated diagnostics (lab, radiology) and pharmacy</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Clinical specialties</h3>
              <p className="text-gray-800 mb-4">
                Cardiology • Orthopedics • Neurology • Gastroenterology • Pulmonology • Nephrology • Obstetrics & Gynecology • Pediatrics • General Surgery • ENT • Dermatology • Ophthalmology • Psychiatry • Physiotherapy
              </p>

              <h3 className="text-lg font-bold text-primary mb-2">Quality & safety</h3>
              <p className="text-gray-800 mb-4">
                We follow strict infection control, medication safety, surgical safety checklists, and data privacy standards.
                Clinical protocols are aligned with national guidelines and best practices.
              </p>

              <h3 className="text-lg font-bold text-primary mb-2">Technology & facilities</h3>
              <p className="text-gray-800 mb-4">
                Modular OTs, ICU and HDU beds, digital medical records, e‑prescriptions, telemedicine consults, reminders, and online appointment booking.
              </p>

              <h3 className="text-lg font-bold text-primary mb-2">Patient‑first commitments</h3>
              <p className="text-gray-800 mb-4">
                Transparent billing, itemized invoices, informed consent, emergency stabilization without advance payment, and access to your medical records—consistent with India’s Charter of Patients’ Rights.
              </p>

              <h3 className="text-lg font-bold text-primary mb-2">Emergency</h3>
              <p className="text-gray-800">24×7 Emergency Helpdesk: +91 7007007007</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsModal;
