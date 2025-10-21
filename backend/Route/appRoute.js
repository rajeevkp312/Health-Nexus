

const express = require('express');
const appModel = require('../Model/appModel');
const appRoute = express.Router();

// Create a new appointment
appRoute.post('/', async (req, res) => {
  try {
    console.log('Appointment data received:', req.body);
    
    // Validate required fields
    const { pid, did, date, time, reason } = req.body;
    if (!pid || !did || !date || !time) {
      return res.status(400).json({ 
        msg: "Missing required fields: pid, did, date, time" 
      });
    }

    const appointmentData = {
      ...req.body,
      reason: reason || 'General Consultation',
      status: 'Scheduled'
    };

    const newAppointment = await appModel.create(appointmentData);
    console.log('Appointment created successfully:', newAppointment._id);
    
    // Emit activity event (SSE)
    try {
      const bus = req.app.get('activityBus');
      if (bus) {
        bus.emit('activity', {
          type: 'appointment',
          message: 'New appointment booked',
          id: String(newAppointment._id || ''),
        });
      }
    } catch (_) {}
    
    res.json({ msg: "Success", appointmentId: newAppointment._id });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        msg: "Validation Error", 
        errors: validationErrors 
      });
    }
    
    // Handle ObjectId cast errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        msg: "Invalid ID format", 
        field: error.path 
      });
    }
    
    res.status(500).json({ msg: error.message });
  }
});

// Get all appointments
appRoute.get('/', async (req, res) => {
  try {
    const app = await appModel.find().lean();
    res.json({ msg: "Success", value: app });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

// Get appointments for a specific doctor
appRoute.get('/d/:did', async (req, res) => {
  try {
    const did = req.params.did;
    console.log('Fetching appointments for doctor ID:', did);
    
    const app = await appModel.find({ did: did }).lean();
    console.log('Found appointments:', app.length);
    
    res.json({ msg: "Success", value: app });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.json({ msg: error.message });
  }
});

// Get appointments for a specific patient
appRoute.get('/p/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    console.log('Fetching appointments for patient ID:', pid);
    
    const app = await appModel.find({ pid: pid }).lean();
    console.log('Found appointments:', app.length);
    
    res.json({ msg: "Success", value: app });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.json({ msg: error.message });
  }
});

// Get a single appointment by its ID
appRoute.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const app = await appModel.findById(id).lean();
    res.json({ msg: "Success", value: app });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

// Update an appointment by ID
appRoute.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await appModel.findByIdAndUpdate(id, req.body);
    res.json({ msg: "Success" });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

// Update appointment status by ID (optional, can extend logic)
appRoute.put('/status/:s/:id', async (req, res) => {
  try {
    const s = req.params.s;
    const id = req.params.id;
    await appModel.findByIdAndUpdate(id, { status: s });
    res.json({ msg: "Success" });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

// Delete an appointment by its ID
appRoute.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await appModel.findByIdAndDelete(id);
    res.json({ msg: "Success" });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

module.exports = appRoute;
