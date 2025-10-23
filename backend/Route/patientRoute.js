const express=require('express');
const patientRoute=express.Router();
const patientModel = require('../Model/patientModel');
const nodemailer=require('nodemailer');
const feedModel = require('../Model/feedModel');
const appModel = require('../Model/appModel');

patientRoute.get('',async(req,res)=>{
    try{
        const patient=await patientModel.find().lean();
        res.json({"msg":"Success","value":patient});
    }

    catch (error){
        res.json({"msg":error})
    }
});

// Debug endpoint to check appointments for a doctor
patientRoute.get('/debug/doctor/:doctorId',async(req,res)=>{
    try{
        const doctorId = req.params.doctorId;
        const appModel = require('../Model/appModel');
        const userModel = require('../Model/userModel');
        
        const appointments = await appModel.find({ did: doctorId }).lean();
        const allPatients = await patientModel.find().lean();
        const allUsers = await userModel.find({ role: 'patient' }).lean();
        
        res.json({
            msg: "Debug Success",
            doctorId,
            appointmentsCount: appointments.length,
            appointments: appointments.map(a => ({
                _id: a._id,
                pid: a.pid,
                patientName: a.patientName,
                status: a.status,
                date: a.date
            })),
            totalPatientsInDB: allPatients.length,
            totalUsersWithPatientRole: allUsers.length,
            patientIds: [...new Set(appointments.map(app => app.pid).filter(Boolean))]
        });
    } catch (error) {
        res.json({msg: "Debug Error", error: error.message});
    }
});

// Get all patients for a specific doctor
patientRoute.get('/doctor/:doctorId',async(req,res)=>{
    try{
        const doctorId = req.params.doctorId;
        console.log('Fetching patients for doctor ID:', doctorId);
        const appModel = require('../Model/appModel');
        const userModel = require('../Model/userModel');
        
        // Get all appointments for this doctor
        const appointments = await appModel.find({ did: doctorId });
        console.log('Found appointments:', appointments.length);
        console.log('Appointment details:', appointments.map(a => ({ pid: a.pid, patientName: a.patientName, status: a.status })));
        
        // Extract unique patient IDs
        const patientIds = [...new Set(appointments.map(app => app.pid).filter(Boolean))];
        console.log('Unique patient IDs:', patientIds);
        
        // Fetch patient details from both collections
        const patients = [];
        
        for (const pid of patientIds) {
            try {
                console.log(`Searching for patient ${pid}...`);
                // First try old patient collection
                let patient = await patientModel.findById(pid).lean();
                console.log(`Patient in patientModel:`, patient ? 'Found' : 'Not found');
                
                // If not found, try new User collection
                if (!patient) {
                    const user = await userModel.findById(pid).lean();
                    console.log(`Patient in userModel:`, user ? `Found (role: ${user.role})` : 'Not found');
                    if (user && user.role === 'patient') {
                        patient = {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            age: user.age,
                            gender: user.gender,
                            bloodGroup: user.bloodGroup,
                            address: user.address,
                            condition: user.condition,
                            lastVisit: user.lastVisit,
                            status: user.status,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt
                        };
                    }
                }
                
                // If still not found, create patient from appointment data
                if (!patient) {
                    console.log(`Patient ${pid} not found in either collection, checking appointment data...`);
                    const appointmentWithPatient = appointments.find(app => app.pid === pid);
                    if (appointmentWithPatient && appointmentWithPatient.patientName) {
                        console.log(`Creating patient from appointment data: ${appointmentWithPatient.patientName}`);
                        patient = {
                            _id: pid,
                            name: appointmentWithPatient.patientName,
                            email: appointmentWithPatient.patientEmail || 'N/A',
                            phone: appointmentWithPatient.patientPhone || 'N/A',
                            age: appointmentWithPatient.patientAge || null,
                            gender: appointmentWithPatient.patientGender || 'N/A',
                            bloodGroup: appointmentWithPatient.patientBloodGroup || 'N/A',
                            address: appointmentWithPatient.patientAddress || 'N/A',
                            condition: 'General',
                            lastVisit: appointmentWithPatient.date,
                            status: 'Active',
                            createdAt: appointmentWithPatient.createdAt,
                            updatedAt: appointmentWithPatient.updatedAt
                        };
                    }
                }
                
                if (patient) {
                    console.log(`Adding patient: ${patient.name}`);
                    patients.push(patient);
                } else {
                    console.log(`Patient ${pid} not found anywhere`);
                }
            } catch (e) {
                console.warn(`Failed to fetch patient ${pid}:`, e);
            }
        }
        
        console.log(`Returning ${patients.length} patients:`, patients.map(p => p.name));
        res.json({"msg":"Success","value":patients});
    }
    catch (error){
        console.error('Error fetching doctor patients:', error);
        res.json({"msg":error})
    }
});


patientRoute.get('/stats/:id',async (req, res) => {
  try {
    const id=req.params.id;
    const f=await feedModel.find({"type":"Feedback","uid":id});
    const s=await feedModel.find({"type":"Suggestion","uid":id});
    const c=await feedModel.find({"type":"Complain","uid":id});
    const a=await appModel.find({"did":id});
    const pena=await appModel.find({"status":"pending","pid":id});
    const cona=await appModel.find({"status":"confirmed","pid":id});
    const coma=await appModel.find({"status":"complete","pid":id});
    const cana=await appModel.find({"status":"cancelled","pid":id});
    const stats={"f":f.length,"s":s.length,"c":c.length,"a":a.length,"pena":pena.length,"cona":cona.length,"coma":coma.length,"cana":cana.length};

    res.json({"msg":"Success",value:stats});
  } catch (error) {
    res.json({"msg":error})
  }
});

patientRoute.get('/:id',async(req,res)=>{
    try{
        const id=req.params.id;
        
        // First try to find in old patient collection
        let patient = await patientModel.findById(id).lean();
        
        // If not found, try to find in new User collection with role='patient'
        if (!patient) {
            const userModel = require('../Model/userModel');
            const user = await userModel.findById(id).lean();
            if (user && user.role === 'patient') {
                // Convert user to patient format for compatibility
                patient = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    age: user.age,
                    gender: user.gender,
                    bloodGroup: user.bloodGroup,
                    address: user.address,
                    lastVisit: user.lastVisit,
                    status: user.status,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            }
        }
        
        if (patient) {
            res.json({"msg":"Success","value":patient});
        } else {
            res.json({"msg":"Patient not found"});
        }
    }
    catch (error){
        res.json({"msg":error})
    }
})
const sendMail=async(to,sub,msg)=>{
  try{
    if(!process.env.SMTP_USER || !process.env.SMTP_PASS){
      console.warn('SMTP credentials not set (SMTP_USER/SMTP_PASS). Skipping email send.');
      return;
    }
    const transport = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
    });
    await transport.sendMail({
        from:`HealthNexus <${process.env.SMTP_USER}>`,
        to,
        subject: sub,
        text:msg 
       });
       console.log("mail sent success")
  }
  catch(error){
    console.log("error during mail:",error);
  }
}

patientRoute.post('/log', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Patient login attempt:', { email });
    
    const patient = await patientModel.findOne({ email });
    
    if (!patient) {
      return res.json({ "msg": "not found" });
    }
    
    const bcrypt = require('bcryptjs');
    const stored = patient.password || '';
    const looksHashed = typeof stored === 'string' && stored.startsWith('$2');
    let valid = false;

    if (looksHashed) {
      valid = await bcrypt.compare(password, stored);
    } else {
      // Plaintext legacy. Compare directly, then migrate to hashed on success
      valid = stored === password;
      if (valid) {
        try {
          const salt = await bcrypt.genSalt(10);
          patient.password = await bcrypt.hash(password, salt);
          await patient.save();
        } catch (merr) {
          console.warn('Patient password migration failed:', merr?.message);
        }
      }
    }

    if (!valid) {
      return res.json({ "msg": "Invalid password" });
    }
    return res.json({ "msg": "Success", "id": patient._id });
    
  } catch (error) {
    console.error("Patient login error:", error);
    return res.status(500).json({ "msg": "Server error", "error": error.message });
  }
});


patientRoute.post('',async(req,res)=>{
    try{
        // Validate required fields
        const required = ['name', 'email', 'phone', 'gender', 'age', 'bloodGroup', 'address'];
        const missing = required.filter(f => !req.body[f] || String(req.body[f]).trim() === '');
        
        if (missing.length) {
            console.error('Missing required fields:', missing);
            return res.status(400).json({ 
                "msg": "Validation failed", 
                "error": `Missing required fields: ${missing.join(', ')}`,
                "missingFields": missing 
            });
        }

        // Check for duplicate email
        const existingPatient = await patientModel.findOne({ email: req.body.email });
        if (existingPatient) {
            console.error('Duplicate email:', req.body.email);
            return res.status(400).json({ 
                "msg": "Patient already exists", 
                "error": "A patient with this email already exists"
            });
        }

        const newPatient = await patientModel.create(req.body);
        sendMail(req.body.email,"Registeration Success",`Welcome to Health Nexus🙋🙋\n Hello ${req.body.name},\n Your Registeration was successfull \n Thank You for Joining HealthNexus`)
        res.json({"msg":"Success", "patient": newPatient})
    }catch(error){
        console.error('Error creating patient:', error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ 
                "msg": "Duplicate entry", 
                "error": `A patient with this ${field} already exists`
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ 
                "msg": "Validation failed", 
                "error": validationErrors.join(', ')
            });
        }
        
        res.status(500).json({"msg": "Error creating patient", "error": error.message})
    }
})

patientRoute.put('/:id',async(req,res)=>{
    try{
        const id=req.params.id;
        console.log('Updating patient with ID:', id);
        console.log('Update data:', req.body);
        
        const patient=await patientModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!patient) {
            return res.status(404).json({"msg": "Patient not found"});
        }
        res.json({"msg":"Success", "patient": patient});
    }
    catch(error){
        console.error('Error updating patient:', error);
        res.status(500).json({"msg": "Error updating patient", "error": error.message});
    }
})

patientRoute.delete('/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        console.log('Deleting patient with ID:', id);
        let deletedFrom = null;
        let patient = await patientModel.findByIdAndDelete(id);
        if (patient) {
            deletedFrom = 'patientModel';
        } else {
            const userModel = require('../Model/userModel');
            const user = await userModel.findById(id).lean();
            if (user && user.role === 'patient') {
                const deletedUser = await userModel.findByIdAndDelete(id);
                if (deletedUser) {
                    deletedFrom = 'userModel';
                    patient = { _id: deletedUser._id, name: deletedUser.name, email: deletedUser.email };
                }
            }
        }
        const apptResult = await appModel.deleteMany({ pid: id });
        if (patient || (apptResult && apptResult.deletedCount > 0)) {
            return res.json({"msg":"Success", "deletedFrom": deletedFrom, "appointmentsRemoved": apptResult?.deletedCount || 0});
        }
        return res.status(404).json({"msg": "Patient not found"});
    }catch(error){
        console.error('Error deleting patient:', error);
        res.status(500).json({"msg": "Error deleting patient", "error": error.message});
    }
})

module.exports=patientRoute;