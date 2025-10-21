import React from 'react';

export function AboutSection() {
  return (
    <section id="about" className="py-8 bg-sky-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            About Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            HealthNexus is a multi‑specialty healthcare network focused on safe, ethical, and patient‑centered care.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Who we are</h3>
            <p className="text-gray-700">
              We bring together experienced clinicians, modern facilities, and digital tools to deliver high‑quality outcomes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-3">Our mission</h3>
            <p className="text-gray-700">
              To make advanced, compassionate healthcare accessible and transparent, so every patient can make informed decisions and receive timely care.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-3">At a glance</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>20+ clinical specialties</li>
              <li>Experienced consultant doctors and nursing teams</li>
              <li>24×7 Emergency & Critical Care</li>
              <li>Day‑care procedures and elective surgeries</li>
              <li>Integrated diagnostics (lab, radiology) and pharmacy</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Clinical specialties</h3>
            <p className="text-gray-700 mb-3">
              Cardiology • Orthopedics • Neurology • Gastroenterology • Pulmonology • Nephrology • Obstetrics & Gynecology • Pediatrics • General Surgery • ENT • Dermatology • Ophthalmology • Psychiatry • Physiotherapy
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-3">Quality & safety</h3>
            <p className="text-gray-700">
              We follow strict infection control, medication safety, surgical safety checklists, and data privacy standards. Clinical protocols are aligned with national guidelines and best practices.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-3">Technology & facilities</h3>
            <p className="text-gray-700">
              Modular OTs, ICU and HDU beds, digital medical records, e‑prescriptions, telemedicine consults, SMS/email reminders, and online appointment booking.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-3">Patient‑first commitments</h3>
            <p className="text-gray-700">
              Transparent billing, itemized invoices, informed consent, emergency stabilization without advance payment, and access to your medical records—consistent with India’s Charter of Patients’ Rights.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-3">Emergency</h3>
            <p className="text-gray-700">24×7 Emergency Helpdesk: +91 7007007007</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
