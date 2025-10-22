const mongoose = require('mongoose');
const doctorModel = require('./Model/doctorModel');

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'healthnexus7',
  serverSelectionTimeoutMS: 30000
});

async function removeDuplicateDoctors() {
  try {
    console.log('Removing duplicate doctors...');
    
    // Find all doctors
    const doctors = await doctorModel.find({});
    console.log(`Found ${doctors.length} total doctors`);
    
    // Group by email to find duplicates
    const emailGroups = {};
    doctors.forEach(doctor => {
      if (!emailGroups[doctor.email]) {
        emailGroups[doctor.email] = [];
      }
      emailGroups[doctor.email].push(doctor);
    });
    
    let duplicatesRemoved = 0;
    
    // Remove duplicates, keep the latest one
    for (const email in emailGroups) {
      const doctorsWithSameEmail = emailGroups[email];
      if (doctorsWithSameEmail.length > 1) {
        console.log(`Found ${doctorsWithSameEmail.length} doctors with email: ${email}`);
        
        // Sort by creation date, keep the latest
        doctorsWithSameEmail.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const keepDoctor = doctorsWithSameEmail[0];
        const duplicatesToRemove = doctorsWithSameEmail.slice(1);
        
        console.log(`Keeping doctor: ${keepDoctor.name} (${keepDoctor._id})`);
        
        // Remove duplicates
        for (const duplicate of duplicatesToRemove) {
          await doctorModel.findByIdAndDelete(duplicate._id);
          console.log(`Removed duplicate: ${duplicate.name} (${duplicate._id})`);
          duplicatesRemoved++;
        }
      }
    }
    
    console.log(`Successfully removed ${duplicatesRemoved} duplicate doctors`);
    
    // Show final count
    const finalCount = await doctorModel.countDocuments();
    console.log(`Final doctor count: ${finalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error removing duplicates:', error);
    process.exit(1);
  }
}

removeDuplicateDoctors();
