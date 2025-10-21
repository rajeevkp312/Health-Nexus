// const express=require('express');
// const adminRoute=express.Router();

// adminRoute.get('',(req,res)=>{
//     res.end("hello");
// })

// adminRoute.post('/log',async(req,res)=>{
//     try {
//         const {email,password}=req.body;
//     const ad=await adminModel.findOne({email});

//     if(!ad){
//         res.json({"msg":"not found"});
//     }

//     else{
//         if(ad.password==password){
//             res.json({"msg":"Success"});
//         }
//         else{
//             res.json({"msg":"Something went wrong😥"});
//         }

//     }
//     } catch (error) {
//         res.json({"msg":error});
//     }
        
//     }

const express = require('express');
const adminRoute = express.Router();
const adminModel = require('../Model/adminModel');
const bcrypt = require('bcryptjs');
const feedModel=require('../Model/feedModel');
const doctorModel=require ('../Model/doctorModel')
const patientModel=require ('../Model/patientModel')
const newsModel=require ('../Model/newsModel')
const appModel=require ('../Model/appModel')
const userModel = require('../Model/userModel');
const multer = require('multer');
const path = require('path');
const OTP = require('../Model/otpModel');
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const RESEND_KEY = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpTransporter = (smtpUser && smtpPass) ? nodemailer.createTransport({
  service: 'gmail',
  auth: { user: smtpUser, pass: smtpPass }
}) : null;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

async function sendOTPEmail(email, otp) {
  const subject = 'Password Reset - HealthNexus';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">HealthNexus</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0;">Admin Password Reset</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Use the following OTP to reset your admin password:</p>
        <div style="background: #f8fafc; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;"><strong>Important:</strong> This OTP will expire in 10 minutes.</p>
      </div>
    </div>`;

  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({ from: `HealthNexus <${smtpUser}>`, to: email, subject, html });
      return true;
    } catch (_) {}
  }
  if (resend) {
    try {
      const { error } = await resend.emails.send({ from: 'HealthNexus <onboarding@resend.dev>', to: [email], subject, html });
      if (!error) return true;
    } catch (_) {}
  }
  console.log(`OTP for ${email}: ${otp}`);
  return true;
}

// ========== ADMIN PROFILE ENDPOINTS ==========
adminRoute.get('/profile/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const ad = await adminModel.findOne({ email }).select('email').lean();
    if (!ad) return res.status(404).json({ msg: 'not found' });
    return res.json({ msg: 'Success', value: ad });
  } catch (error) {
    return res.status(500).json({ msg: 'Error fetching admin profile', error: error.message });
  }
});

adminRoute.put('/profile/:email', async (req, res) => {
  try {
    const currentEmail = req.params.email;
    const update = {};
    const { email, password } = req.body || {};
    if (email) update.email = email;
    if (password) update.password = password;

    if (update.email && update.email !== currentEmail) {
      const exists = await adminModel.findOne({ email: update.email });
      if (exists) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    const updated = await adminModel.findOneAndUpdate({ email: currentEmail }, update, { new: true });
    if (!updated) return res.status(404).json({ msg: 'not found' });
    return res.json({ msg: 'Success', value: { email: updated.email } });
  } catch (error) {
    return res.status(500).json({ msg: 'Error updating admin', error: error.message });
  }
});

adminRoute.delete('/profile/:email', async (req, res) => {
  try {
    const currentEmail = req.params.email;
    const del = await adminModel.findOneAndDelete({ email: currentEmail });
    if (!del) return res.status(404).json({ msg: 'not found' });
    return res.json({ msg: 'Success' });
  } catch (error) {
    return res.status(500).json({ msg: 'Error deleting admin', error: error.message });
  }
});

const upload = multer({ storage: storage });


adminRoute.get('', (req, res) => {
  res.json({ msg: "Admin route is working!" });
});

adminRoute.get('/test', (req, res) => {
  res.json({ msg: "Admin test route working!", timestamp: new Date() });
});

adminRoute.get('/stats',async (req, res) => {
  try {
    // Legacy collections
    const [dLegacy, pLegacy, f, s, c, n, a, pena] = await Promise.all([
      doctorModel.find({}, 'email').lean(),
      patientModel.find({}, 'email').lean(),
      feedModel.find({ type: 'Feedback' }).lean(),
      feedModel.find({ type: 'Suggestion' }).lean(),
      feedModel.find({ type: 'Complain' }).lean(),
      newsModel.find().lean(),
      appModel.find().lean(),
      appModel.find({ status: 'pending' }).lean()
    ]);

    // Deduplicate using User model (role-based) by email
    const pEmails = new Set((pLegacy || []).map(p => String(p.email || '').toLowerCase()));
    const dEmails = new Set((dLegacy || []).map(d => String(d.email || '').toLowerCase()));

    const [uPatientsExtra, uDoctorsExtra] = await Promise.all([
      userModel.countDocuments({ role: 'patient', email: { $nin: Array.from(pEmails) } }),
      userModel.countDocuments({ role: 'doctor', email: { $nin: Array.from(dEmails) } })
    ]);

    const totalPatients = (pLegacy?.length || 0) + (uPatientsExtra || 0);
    const totalDoctors = (dLegacy?.length || 0) + (uDoctorsExtra || 0);

    const stats = {
      d: totalDoctors,
      p: totalPatients,
      f: f.length,
      s: s.length,
      c: c.length,
      n: n.length,
      a: a.length,
      pena: pena.length
    };

    res.json({ msg: 'Success', value: stats });
  } catch (error) {
    res.json({ msg: error });
  }
});

// Recent activities feed (initial load for dashboard)
adminRoute.get('/activity/recent', async (req, res) => {
  try {
    const [apps, feeds, news, docs] = await Promise.all([
      appModel.find().sort({ createdAt: -1 }).limit(10).lean(),
      feedModel.find().sort({ updatedAt: -1 }).limit(10).lean(),
      newsModel.find().sort({ createdAt: -1 }).limit(10).lean(),
      doctorModel.find().sort({ updatedAt: -1 }).limit(10).lean(),
    ]);

    const items = [];

    for (const a of (apps || [])) {
      items.push({
        type: 'appointment',
        message: a.patientName ? `New appointment booked by ${a.patientName}` : 'New appointment booked',
        ts: a.createdAt || a.updatedAt || new Date(),
        id: String(a._id || ''),
      });
    }

    for (const f of (feeds || [])) {
      const status = (f.status || 'pending');
      const msg = status === 'pending' ? 'New feedback received from patient' : `Feedback ${status}`;
      items.push({
        type: 'feedback',
        message: msg,
        ts: f.updatedAt || f.createdAt || new Date(),
        id: String(f._id || ''),
      });
    }

    for (const n of (news || [])) {
      const msg = (n.status === 'published') ? 'Health article published successfully' : 'News article updated';
      items.push({
        type: 'news',
        message: msg,
        ts: n.publishDate || n.createdAt || n.updatedAt || new Date(),
        id: String(n._id || ''),
      });
    }

    for (const d of (docs || [])) {
      items.push({
        type: 'doctor',
        message: `${d.name || 'Doctor'} updated profile`,
        ts: d.updatedAt || d.createdAt || new Date(),
        id: String(d._id || ''),
      });
    }

    items.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const top = items.slice(0, 20);
    return res.json({ msg: 'Success', value: top });
  } catch (error) {
    return res.status(500).json({ msg: 'Error building recent activities', error: error.message });
  }
});


adminRoute.post('/log', async (req, res) => {
  console.log('Admin login route hit!', req.body);
  try {
    const { email, password } = req.body;
    console.log('Looking for admin with email:', email);
    const ad = await adminModel.findOne({ email });
    console.log('Found admin:', ad ? 'Yes' : 'No');

    if (!ad) {
      console.log('Admin not found');
      return res.json({ msg: 'not found' });
    }

    const stored = ad.password || '';
    const looksHashed = typeof stored === 'string' && stored.startsWith('$2');
    let valid = false;

    if (looksHashed) {
      valid = await bcrypt.compare(password, stored);
    } else {
      // Legacy plaintext: compare directly, then migrate to bcrypt
      valid = stored === password;
      if (valid) {
        try {
          const salt = await bcrypt.genSalt(10);
          ad.password = await bcrypt.hash(password, salt);
          await ad.save();
          console.log('Admin password migrated to bcrypt');
        } catch (merr) {
          console.warn('Admin password migration failed:', merr?.message);
        }
      }
    }

    if (!valid) {
      console.log('Password mismatch');
      return res.json({ msg: 'Invalid password' });
    }
    console.log('Password match - login successful');
    return res.json({ msg: 'Success' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

adminRoute.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const admin = await adminModel.findOne({ email });
    if (!admin) return res.status(400).json({ msg: 'not found' });

    const otp = generateOTP();
    await OTP.create({ email, otp, type: 'forgot_password' });
    const ok = await sendOTPEmail(email, otp);
    if (!ok) return res.status(500).json({ msg: 'Failed to send reset email' });
    return res.json({ msg: 'Success' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

adminRoute.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: 'Email, OTP and newPassword are required' });
    }

    const otpRecord = await OTP.findOne({ email, otp, type: 'forgot_password', isUsed: false });
    if (!otpRecord) return res.status(400).json({ msg: 'Invalid or expired OTP' });

    otpRecord.isUsed = true;
    await otpRecord.save();

    const admin = await adminModel.findOne({ email });
    if (!admin) return res.status(400).json({ msg: 'not found' });
    admin.password = newPassword;
    await admin.save();
    return res.json({ msg: 'Success' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

// ========== DOCTOR MANAGEMENT ENDPOINTS ==========

  // Get all doctors
  adminRoute.get('/doctors', async (req, res) => {
    try {
      const doctors = await doctorModel.find().select('-password').lean();
      // Return both formats for compatibility
      res.json({ "msg": "Success", "doctors": doctors, "value": doctors });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ "msg": "Error fetching doctors", "error": error.message });
    }
  });

// Add new doctor
adminRoute.post('/add-doctor', upload.single('image'), async (req, res) => {
  try {
    const doctorData = {
      ...req.body,
      image: req.file ? req.file.path : null
    };
    
    const newDoctor = await doctorModel.create(doctorData);
    res.json({ "msg": "Success", "doctor": newDoctor });
  } catch (error) {
    res.status(500).json({ "msg": "Error adding doctor", "error": error.message });
  }
});

// Get single doctor
adminRoute.get('/doctor/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doctor = await doctorModel.findById(id).lean();
    
    if (!doctor) {
      return res.status(404).json({ "msg": "Doctor not found" });
    }
    
    res.json({ "msg": "Success", "doctor": doctor });
  } catch (error) {
    res.status(500).json({ "msg": "Error fetching doctor", "error": error.message });
  }
});

// Update doctor
adminRoute.put('/doctor/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    const updatedDoctor = await doctorModel.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedDoctor) {
      return res.status(404).json({ "msg": "Doctor not found" });
    }
    
    res.json({ "msg": "Success", "doctor": updatedDoctor });
  } catch (error) {
    res.status(500).json({ "msg": "Error updating doctor", "error": error.message });
  }
});

// Delete doctor
adminRoute.delete('/doctor/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await doctorModel.findByIdAndDelete(id);
    res.json({ "msg": "Success" });
  } catch (error) {
    res.status(500).json({ "msg": "Error deleting doctor", "error": error.message });
  }
});

// ========== PATIENT MANAGEMENT ENDPOINTS ==========

// Get all patients
adminRoute.get('/patients', async (req, res) => {
  try {
    const [legacyPatients, usersPatients] = await Promise.all([
      patientModel.find().lean(),
      userModel.find({ role: 'patient' }).lean()
    ]);

    // Build a set of existing emails from legacy collection to avoid duplicates
    const legacyEmails = new Set((legacyPatients || []).map(p => String(p.email || '').toLowerCase()));

    // Map userModel patients to the same shape as legacy patients
    const mappedUsers = (usersPatients || []).filter(u => !legacyEmails.has(String(u.email || '').toLowerCase()))
      .map(u => ({
        // keep original id as 'id' to distinguish from legacy _id
        id: u._id?.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        age: u.age,
        gender: u.gender,
        bloodGroup: u.bloodGroup,
        address: u.address,
        condition: u.condition || 'General Checkup',
        lastVisit: u.lastVisit || new Date(),
        status: u.status || 'Active',
        image: u.image || null,
      }));

    const combined = [...(legacyPatients || []), ...mappedUsers];

    res.json({ "msg": "Success", "patients": combined, "value": combined });
  } catch (error) {
    res.status(500).json({ "msg": "Error fetching patients", "error": error.message });
  }
});

// Add new patient
adminRoute.post('/add-patient', async (req, res) => {
  try {
    console.log('Received patient data:', req.body);
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'age', 'gender', 'bloodGroup', 'address'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        "msg": "Validation failed", 
        "error": `The following fields are required: ${missingFields.join(', ')}`,
        "missingFields": missingFields
      });
    }
    
    // Check if email already exists
    const existingPatient = await patientModel.findOne({ email: req.body.email });
    if (existingPatient) {
      return res.status(400).json({ 
        "msg": "Validation failed", 
        "error": "A patient with this email already exists"
      });
    }
    
    const newPatient = await patientModel.create(req.body);
    res.json({ "msg": "Success", "patient": newPatient });
  } catch (error) {
    console.error('Error adding patient:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        "msg": "Validation failed", 
        "error": validationErrors.join(', '),
        "validationErrors": validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        "msg": "Validation failed", 
        "error": "A patient with this email already exists"
      });
    }
    
    res.status(500).json({ "msg": "Error adding patient", "error": error.message });
  }
});

// Update patient
adminRoute.put('/patient/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPatient = await patientModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ "msg": "Success", "patient": updatedPatient });
  } catch (error) {
    res.status(500).json({ "msg": "Error updating patient", "error": error.message });
  }
});

// Delete patient
adminRoute.delete('/patient/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await patientModel.findByIdAndDelete(id);
    res.json({ "msg": "Success" });
  } catch (error) {
    res.status(500).json({ "msg": "Error deleting patient", "error": error.message });
  }
});

// ========== APPOINTMENT MANAGEMENT ENDPOINTS ==========

// Get all appointments
adminRoute.get('/appointments', async (req, res) => {
  try {
    const appointments = await appModel.find()
      .populate('did', 'name spe')
      .populate('pid', 'name email number')
      .lean();
    res.json({ "msg": "Success", "appointments": appointments });
  } catch (error) {
    res.status(500).json({ "msg": "Error fetching appointments", "error": error.message });
  }
});

// Update appointment status
adminRoute.put('/appointment/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const updatedAppointment = await appModel.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    res.json({ "msg": "Success", "appointment": updatedAppointment });
  } catch (error) {
    res.status(500).json({ "msg": "Error updating appointment", "error": error.message });
  }
});

// ========== NEWS MANAGEMENT ENDPOINTS ==========

// Get all news
adminRoute.get('/news', async (req, res) => {
  try {
    const news = await newsModel.find().sort({ createdAt: -1 }).lean();
    res.json({ "msg": "Success", "news": news });
  } catch (error) {
    res.status(500).json({ "msg": "Error fetching news", "error": error.message });
  }
});

// Add new news article
adminRoute.post('/news', upload.single('image'), async (req, res) => {
  try {
    const newsData = {
      ...req.body,
      image: req.file ? req.file.path : null,
      publishDate: new Date()
    };
    
    const newNews = await newsModel.create(newsData);
    res.json({ "msg": "Success", "news": newNews });
  } catch (error) {
    res.status(500).json({ "msg": "Error adding news", "error": error.message });
  }
});

// Update news article
adminRoute.put('/news/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    const updatedNews = await newsModel.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ "msg": "Success", "news": updatedNews });
  } catch (error) {
    res.status(500).json({ "msg": "Error updating news", "error": error.message });
  }
});

// Delete news article
adminRoute.delete('/news/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await newsModel.findByIdAndDelete(id);
    res.json({ "msg": "Success" });
  } catch (error) {
    res.status(500).json({ "msg": "Error deleting news", "error": error.message });
  }
});

// ========== FEEDBACK & ENQUIRY ENDPOINTS ==========

// Get all feedback
adminRoute.get('/feedback', async (req, res) => {
  try {
    const feedback = await feedModel.find().sort({ createdAt: -1 }).lean();
    res.json({ "msg": "Success", "feedback": feedback });
  } catch (error) {
    res.status(500).json({ "msg": "Error fetching feedback", "error": error.message });
  }
});

// Get enquiries
adminRoute.get('/enquiries', async (req, res) => {
  try {
    const enquiries = await feedModel.find({ type: "Enquiry" }).sort({ createdAt: -1 }).lean();
    res.json({ "msg": "Success", "enquiries": enquiries });
  } catch (error) {
    res.status(500).json({ "msg": "Error fetching enquiries", "error": error.message });
  }
});

// Update feedback status
adminRoute.put('/feedback/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedFeedback = await feedModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ "msg": "Success", "feedback": updatedFeedback });
  } catch (error) {
    res.status(500).json({ "msg": "Error updating feedback", "error": error.message });
  }
});

module.exports = adminRoute;