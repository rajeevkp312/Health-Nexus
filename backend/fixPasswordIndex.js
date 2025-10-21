const mongoose = require('mongoose');
const doctorModel = require('./Model/doctorModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/healthnexus7');

async function fixPasswordIndex() {
  try {
    console.log('Fixing password index issue...');
    
    // Get all indexes
    const indexes = await doctorModel.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));
    
    // Check if password_1 index exists and drop it
    if (indexes.password_1) {
      console.log('Found password_1 index, dropping it...');
      await doctorModel.collection.dropIndex('password_1');
      console.log('Successfully dropped password_1 index');
    }
    
    // Update all doctors with duplicate passwords to have unique ones
    const doctors = await doctorModel.find({ password: 'doctor123' });
    console.log(`Found ${doctors.length} doctors with default password`);
    
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      const newPassword = `doctor${Date.now()}${i}`;
      await doctorModel.findByIdAndUpdate(doctor._id, { password: newPassword });
      console.log(`Updated doctor ${doctor.name} password`);
    }
    
    console.log('Password index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing password index:', error);
    process.exit(1);
  }
}

fixPasswordIndex();
