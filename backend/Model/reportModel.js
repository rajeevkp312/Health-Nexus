const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: false },
  dose: { type: String, required: false },
  frequency: { type: String, required: false },
  duration: { type: String, required: false },
  instructions: { type: String, required: false }
}, { _id: false });

const VitalsSchema = new mongoose.Schema({
  temp: { type: String, required: false },
  bp: { type: String, required: false },
  hr: { type: String, required: false },
  rr: { type: String, required: false },
  spo2: { type: String, required: false }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, index: true },
  pid: { type: String, required: true, index: true },
  did: { type: String, required: true, index: true },

  hospitalName: { type: String, required: false },
  hospitalAddress: { type: String, required: false },
  hospitalPhone: { type: String, required: false },
  reportDate: { type: Date, default: Date.now },

  // Patient info
  patientName: { type: String, required: false },
  patientDob: { type: String, required: false }, // store as YYYY-MM-DD string for simplicity
  patientGender: { type: String, required: false },
  patientIdSnapshot: { type: String, required: false },
  patientContact: { type: String, required: false },
  patientEmail: { type: String, required: false },
  patientBloodGroup: { type: String, required: false },
  patientAddress: { type: String, required: false },

  // Doctor info
  doctorName: { type: String, required: false },
  doctorSpecialty: { type: String, required: false },
  doctorLicenseNumber: { type: String, required: false },

  chiefComplaint: { type: String, required: false },
  hpi: { type: String, required: false },
  pmh: { type: String, required: false },
  medications: { type: [MedicationSchema], default: [] },
  allergies: { type: String, required: false },
  familyHistory: { type: String, required: false },
  socialHistory: { type: String, required: false },
  ros: { type: String, required: false },

  // Physical examination
  generalAppearance: { type: String, required: false },
  vitals: { type: VitalsSchema, default: {} },
  heent: { type: String, required: false },
  neck: { type: String, required: false },
  cardiovascular: { type: String, required: false },
  respiratory: { type: String, required: false },
  abdomen: { type: String, required: false },
  musculoskeletal: { type: String, required: false },
  neurological: { type: String, required: false },
  dermatological: { type: String, required: false },

  labsImaging: { type: String, required: false },
  assessment: { type: String, required: false },
  plan: { type: String, required: false },
  investigations: { type: String, required: false },
  medicationsPlan: { type: [MedicationSchema], default: [] },
  prescribedMedicines: { type: [MedicationSchema], default: [] },
  referrals: { type: String, required: false },
  lifestyleAdvice: { type: String, required: false },
  followUp: { type: String, required: false },

  doctorSignature: { type: String, required: false },
  signatureDate: { type: String, required: false },

  // Appointment Request Form specific fields
  preferredDate: { type: String, required: false },
  alternateDate: { type: String, required: false },
  preferredTime: { type: String, required: false },
  alternateTime: { type: String, required: false },
  appointmentType: { type: String, required: false },
  appointmentTypeOther: { type: String, required: false },
  reason: { type: String, required: false },
  reasonOther: { type: String, required: false },
  providerPreferred: { type: String, required: false },
  providerSpecialty: { type: String, required: false },
  coverageProvider: { type: String, required: false },
  coverageNumber: { type: String, required: false },
  additionalInfo: { type: String, required: false },
  emName: { type: String, required: false },
  emRelationship: { type: String, required: false },
  emPhone: { type: String, required: false },
  emEmail: { type: String, required: false },
  officeAppointmentDate: { type: String, required: false },
  officeAppointmentTime: { type: String, required: false },
  officeProvider: { type: String, required: false },
  officeConfirmation: { type: String, required: false },
  officeNotes: { type: String, required: false },

  // Publishing status
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, required: false },
  patientAge: { type: String, required: false },
  medicalExpert: { type: String, required: false },
  expertQualifications: { type: String, required: false }

}, { timestamps: true });

module.exports = mongoose.model('report', ReportSchema);
