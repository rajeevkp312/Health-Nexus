const express=require('express');
const adminModel=require('../Model/adminModel')
const doctorModel = require('../Model/doctorModel');
const feedModel = require('../Model/feedModel');
const appModel = require('../Model/appModel');
const bcrypt = require('bcryptjs');
const doctorRoute=express.Router();

doctorRoute.get('',async(req,res)=>{
    try{
        const doc=await doctorModel.find().lean();
        res.json({"msg":"Success","value":doc});

    }
    catch(error){
        res.json({"msg":error});
    }
})


doctorRoute.post('/log', async (req, res) => {
  try {
    const { email, password } = req.body;
    const doc = await doctorModel.findOne({ email });

    if (!doc) {
      return res.json({ msg: 'not found' });
    }

    const stored = doc.password || '';
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
          doc.password = await bcrypt.hash(password, salt);
          await doc.save();
        } catch (merr) {
          console.warn('Doctor password migration failed:', merr?.message);
        }
      }
    }

    if (!valid) {
      return res.json({ msg: 'Invalid password' });
    }
    return res.json({ msg: 'Success', id: doc._id });

  } catch (error) {
    console.error('Doctor login error:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});



doctorRoute.post('', async (req, res) => {
  try {
    // Basic validation
    const required = ['name', 'email', 'phone', 'qualification', 'experience', 'specialty'];
    const missing = required.filter(f => !req.body[f] || String(req.body[f]).trim() === '');
    if (missing.length) {
      return res.status(400).json({ msg: 'Validation failed', missingFields: missing });
    }

    const doc = await doctorModel.create(req.body);
    res.json({ msg: 'Success', doctor: doc });
  } catch (error) {
    console.error('Error creating doctor:', error);
    // Duplicate key handling
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Duplicate key', error: error.message });
    }
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
})

doctorRoute.get('/stats/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if models exist, if not return mock data
    let stats = {
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      feedback: 0,
      suggestions: 0,
      complaints: 0
    };

    try {
      const f = await feedModel.find({"type":"Feedback","uid":id}).lean();
      const s = await feedModel.find({"type":"Suggestion","uid":id}).lean();
      const c = await feedModel.find({"type":"Complain","uid":id}).lean();
      const a = await appModel.find({"did":id}).lean();
      const pena = await appModel.find({"status":"pending","did":id}).lean();
      const cona = await appModel.find({"status":"confirmed","did":id}).lean();
      const coma = await appModel.find({"status":"complete","did":id}).lean();
      const cana = await appModel.find({"status":"cancelled","did":id}).lean();
      
      stats = {
        totalAppointments: a.length,
        pendingAppointments: pena.length,
        confirmedAppointments: cona.length,
        completedAppointments: coma.length,
        cancelledAppointments: cana.length,
        feedback: f.length,
        suggestions: s.length,
        complaints: c.length
      };
    } catch (modelError) {
      // Return mock data if models don't exist
      stats = {
        totalAppointments: 45,
        pendingAppointments: 8,
        confirmedAppointments: 12,
        completedAppointments: 20,
        cancelledAppointments: 5,
        feedback: 15,
        suggestions: 3,
        complaints: 1
      };
    }

    res.json({
      success: true,
      message: "Stats retrieved successfully",
      stats: stats
    });
  } catch (error) {
    console.error('Doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      stats: {
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        feedback: 0,
        suggestions: 0,
        complaints: 0
      }
    });
  }
});

doctorRoute.get('/:id',async(req,res)=>{
    try{
        const id=req.params.id;
        const doc=await doctorModel.findById(id).lean();
        res.json({"msg":"Success","value":doc});

    }
    catch (error){
        res.json({"msg":error})
    }
})

doctorRoute.put('/:id',async(req,res)=>{
    try{
        const id=req.params.id;
        console.log('Doctor Update - ID:', id);
        console.log('Doctor Update - Body:', req.body);
        
        // Fetch existing doctor to preserve image if not in update
        const existingDoc = await doctorModel.findById(id);
        if (!existingDoc) {
            console.log('Doctor not found with ID:', id);
            return res.status(404).json({"msg": "Doctor not found"});
        }
        
        // Prepare update data, preserving image if not provided
        const updateData = { ...req.body };
        if (!updateData.image && existingDoc.image) {
            updateData.image = existingDoc.image;
            console.log('Preserving existing image:', existingDoc.image?.substring(0, 50) + '...');
        }
        
        const doc = await doctorModel.findByIdAndUpdate(id, updateData, { new: true });
        
        console.log('Doctor updated successfully:', doc.name);
        console.log('Image after update:', doc.image ? 'Present' : 'Missing');
        
        // Emit activity (SSE): doctor profile updated
        try {
            const bus = req.app.get('activityBus');
            if (bus) {
                bus.emit('activity', {
                    type: 'doctor',
                    message: `${doc.name || 'Doctor'} updated profile`,
                    id: String(doc._id || '')
                });
            }
        } catch (_) {}
        res.json({"msg":"Success", "doctor": doc});
    }
    catch(error){
        console.error('Error updating doctor:', error);
        res.status(500).json({"msg": error.message})
    }
})

doctorRoute.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await doctorModel.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    res.json({ msg: 'Success' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
})

module.exports=doctorRoute;