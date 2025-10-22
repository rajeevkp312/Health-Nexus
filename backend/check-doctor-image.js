const mongoose = require('mongoose');
const doctorModel = require('./Model/doctorModel');

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'healthnexus7',
  serverSelectionTimeoutMS: 30000
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error: ${err}`));

async function checkDoctorImage() {
  try {
    // Find Pawan Singh doctor
    const doctor = await doctorModel.findOne({ name: "Pawan Singh" });
    
    if (doctor) {
      console.log('Doctor found:');
      console.log('Name:', doctor.name);
      console.log('Email:', doctor.email);
      console.log('ID:', doctor._id);
      console.log('Image field exists:', !!doctor.image);
      
      if (doctor.image) {
        console.log('Image type:', doctor.image.startsWith('data:image/') ? 'Base64' : 'File Path');
        console.log('Image length:', doctor.image.length);
        console.log('Image preview (first 100 chars):', doctor.image.substring(0, 100));
      } else {
        console.log('No image field found');
      }
    } else {
      console.log('Doctor "Pawan Singh" not found');
      
      // List all doctors
      const allDoctors = await doctorModel.find({}, 'name email image');
      console.log('\nAll doctors in database:');
      allDoctors.forEach(doc => {
        console.log(`- ${doc.name} (${doc.email}) - Image: ${!!doc.image}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDoctorImage();
