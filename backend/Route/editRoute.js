const express = require('express');
const router = express.Router();
const doctorModel = require('../Model/editModel'); // Adjust path if needed

// Get doctor by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doctor = await doctorModel.findById(id);
    if (doctor) {
      res.json({ msg: 'Success', value: doctor });
    } else {
      res.status(404).json({ msg: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update doctor by id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(id, updateData, { new: true });
    if (doctor) {
      res.json({ msg: 'Success', value: doctor });
    } else {
      res.status(404).json({ msg: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
