const express = require('express');
const Report = require('../Model/reportModel');
const appModel = require('../Model/appModel');
const patientModel = require('../Model/patientModel');
const doctorModel = require('../Model/doctorModel');

const reportRoute = express.Router();

// Create report (doctor)
reportRoute.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.appointmentId || !data.pid || !data.did) {
      return res.status(400).json({ msg: 'appointmentId, pid and did are required' });
    }

    // Try prefill from appointment if exists
    try {
      const appt = await appModel.findById(data.appointmentId);
      if (appt) {
        data.pid = data.pid || appt.pid;
        data.did = data.did || appt.did;
        data.patientName = data.patientName || appt.patientName;
        data.patientContact = data.patientContact || appt.patientPhone;
        data.patientEmail = data.patientEmail || appt.patientEmail;
        data.patientBloodGroup = data.patientBloodGroup || appt.patientBloodGroup || appt?.patientDetails?.bloodGroup || appt?.patientDetails?.bloodgrp;
        data.patientAddress = data.patientAddress || appt.patientAddress;
        data.patientGender = data.patientGender || appt.patientGender;
        data.chiefComplaint = data.chiefComplaint || appt.reason || appt.description;
      }
    } catch (e) {}

    // Prefill doctor/patient snapshots if possible
    try {
      const doc = await doctorModel.findById(data.did);
      if (doc) {
        data.doctorName = data.doctorName || doc.name;
        data.doctorSpecialty = data.doctorSpecialty || doc.spe;
      }
    } catch (e) {}

    try {
      const pat = await patientModel.findById(data.pid);
      if (pat) {
        data.patientName = data.patientName || pat.name;
        data.patientGender = data.patientGender || pat.gender;
        data.patientContact = data.patientContact || pat.phone || pat.number;
        data.patientEmail = data.patientEmail || pat.email;
        data.patientBloodGroup = data.patientBloodGroup || pat.bloodGroup || pat.bloodgrp;
        data.patientAddress = data.patientAddress || pat.address;
      }
    } catch (e) {}

    const report = await Report.create(data);
    res.json({ msg: 'Success', value: report });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get report by ID (keep after specific routes)
reportRoute.get('/:id', async (req, res) => {
  try {
    const rep = await Report.findById(req.params.id);
    if (!rep) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Success', value: rep });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get all reports (admin)
reportRoute.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ msg: 'Success', value: reports });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get report by ID
// Get report by appointment ID
reportRoute.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const rep = await Report.findOne({ appointmentId: req.params.appointmentId });
    if (!rep) return res.json({ msg: 'Not found', value: null });
    res.json({ msg: 'Success', value: rep });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// List reports for a patient
reportRoute.get('/patient/:pid', async (req, res) => {
  try {
    const list = await Report.find({ pid: req.params.pid }).sort({ createdAt: -1 });
    res.json({ msg: 'Success', value: list });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// List reports for a doctor
reportRoute.get('/doctor/:did', async (req, res) => {
  try {
    const list = await Report.find({ did: req.params.did }).sort({ createdAt: -1 });
    res.json({ msg: 'Success', value: list });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update report
reportRoute.put('/:id', async (req, res) => {
  try {
    const rep = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: 'Success', value: rep });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Delete report
reportRoute.delete('/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Success' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Publish report (make it visible to patient)
reportRoute.put('/:id/publish', async (req, res) => {
  try {
    const rep = await Report.findByIdAndUpdate(
      req.params.id, 
      { 
        isPublished: true, 
        publishedAt: new Date() 
      }, 
      { new: true }
    );
    if (!rep) return res.status(404).json({ msg: 'Report not found' });
    res.json({ msg: 'Report published successfully', value: rep });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Unpublish report (hide from patient)
reportRoute.put('/:id/unpublish', async (req, res) => {
  try {
    const rep = await Report.findByIdAndUpdate(
      req.params.id, 
      { 
        isPublished: false, 
        publishedAt: null 
      }, 
      { new: true }
    );
    if (!rep) return res.status(404).json({ msg: 'Report not found' });
    res.json({ msg: 'Report unpublished successfully', value: rep });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get published reports for a patient (only published ones)
reportRoute.get('/patient/:pid/published', async (req, res) => {
  try {
    const list = await Report.find({ 
      pid: req.params.pid, 
      isPublished: true 
    }).sort({ publishedAt: -1 });
    res.json({ msg: 'Success', value: list });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = reportRoute;
