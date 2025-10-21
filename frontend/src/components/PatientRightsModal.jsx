import React from 'react';
import { X } from 'lucide-react';

export function PatientRightsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Fundamental Rights',
      items: [
        'Right to Information - Access information about illness, diagnosis, causes, potential complications, and treatment options in an understandable language.',
        'Right to Records and Reports - Access to medical records, case papers, investigation reports, and indoor patient records (originals or copies) cannot be denied.',
        'Right to Emergency Medical Care - All hospitals (public and private) must provide basic emergency care without prior payment.',
        'Right to Informed Consent - Explicit written consent required for potentially hazardous treatments (e.g., surgery, chemotherapy) after understanding risks.',
        'Right to Confidentiality, Dignity, and Privacy - Strict confidentiality of health conditions and treatments; female patients may have another female present during examinations by male physicians.'
      ]
    },
    {
      title: 'Choice and Decision-Making Rights',
      items: [
        'Right to Second Opinion - Seek consultation from another practitioner; hospitals must facilitate required information/records.',
        'Right to Choose Alternative Treatment Options - Freedom to consider alternatives or refuse treatment if available.',
        'Right to Choose Source for Medicines/Tests - Obtain medicines and diagnostics from any registered pharmacy or laboratory.',
        'Right to Refuse Treatment - Decline proposed treatments after being informed of consequences.'
      ]
    },
    {
      title: 'Financial and Administrative Rights',
      items: [
        'Right to Transparency in Rates - Hospitals must display charges and provide itemized bills; essential medicines/devices must comply with NPPA rates.',
        'Right to Proper Referral and Transfer - Justified explanations for transfers/referrals without commercial influence; confirmation from receiving hospital.',
        'Right to Discharge - Patients cannot be detained for procedural reasons (e.g., payment disputes); families have the right to receive the body of deceased patients.'
      ]
    },
    {
      title: 'Protection and Equality Rights',
      items: [
        'Right to Non-Discrimination - No denial of treatment based on gender, caste, religion, age, sexual orientation, social origin, or health conditions (including HIV status).',
        'Right to Safety and Quality Care - Hygienic, sanitized environments and care per established standards.',
        'Right to Considerate and Respectful Care - Dignified and respectful treatment throughout the healthcare experience.',
        'Right to Protection in Clinical Trials and Research - Protection per DGHS and National Ethical Guidelines.'
      ]
    },
    {
      title: 'Access and Advocacy Rights',
      items: [
        'Right to Continuity of Care - Ongoing, coordinated healthcare services.',
        'Right to Patient Education - Information about condition plus public health services, insurance schemes, and charitable hospitals.',
        'Right to Be Heard and Seek Redressal - Provide feedback, file complaints, and seek remedies for rights violations.',
        'Right to Freedom from Abuse or Harassment - Protection from all forms of mistreatment during healthcare.'
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Patient Rights (India)</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <p className="text-sm text-gray-700 mb-4">
            These rights are formalized in India&apos;s Charter of Patients&apos; Rights, expanded to 20 rights in August 2021 with approval from the National Council for Clinical Establishments.
          </p>

          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-lg font-bold text-primary mb-2">{section.title}</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-800">
                {section.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
