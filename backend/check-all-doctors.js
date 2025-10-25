const mongoose = require('mongoose');
const doctorModel = require('./Model/doctorModel');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { 
  dbName: process.env.DB_NAME || 'healthnexus7' 
}).then(async () => {
  console.log('Connected to MongoDB\n');
  
  const docs = await doctorModel.find({}, 'name email image').lean();
  
  console.log(`Total doctors: ${docs.length}\n`);
  
  docs.forEach((d, i) => {
    const hasImg = !!d.image;
    let imgType = 'None';
    let imgPreview = 'N/A';
    
    if (hasImg) {
      if (d.image.startsWith('data:image/')) {
        imgType = 'Base64';
        imgPreview = d.image.substring(0, 50) + '...';
      } else if (d.image.startsWith('uploads/') || d.image.startsWith('uploads\\')) {
        imgType = 'FilePath';
        imgPreview = d.image;
      } else {
        imgType = 'Unknown';
        imgPreview = d.image.substring(0, 50);
      }
    }
    
    console.log(`${i + 1}. ${d.name}`);
    console.log(`   Email: ${d.email}`);
    console.log(`   Image Type: ${imgType}`);
    console.log(`   Image: ${imgPreview}`);
    console.log('');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
