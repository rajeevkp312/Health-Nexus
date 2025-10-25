const mongoose = require('mongoose');
const doctorModel = require('./Model/doctorModel');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { 
  dbName: process.env.DB_NAME || 'healthnexus7' 
}).then(async () => {
  console.log('Connected to MongoDB\n');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const existingFiles = fs.readdirSync(uploadsDir);
  console.log(`Files in uploads directory: ${existingFiles.length}\n`);
  
  const doctors = await doctorModel.find({});
  console.log(`Total doctors: ${doctors.length}\n`);
  
  let fixed = 0;
  let skipped = 0;
  
  for (const doctor of doctors) {
    if (!doctor.image) {
      console.log(`✓ ${doctor.name} - No image field, skipping`);
      skipped++;
      continue;
    }
    
    // If it's a base64 image, keep it
    if (doctor.image.startsWith('data:image/')) {
      console.log(`✓ ${doctor.name} - Base64 image, keeping as is`);
      skipped++;
      continue;
    }
    
    // Extract filename from path
    const filename = doctor.image.replace(/^uploads[\\\/]/, '').split(/[\\\/]/).pop();
    
    // Check if file exists
    const fileExists = existingFiles.includes(filename);
    
    if (!fileExists) {
      console.log(`✗ ${doctor.name} - File not found: ${filename}`);
      console.log(`  Setting image to null (will show initials fallback)`);
      doctor.image = null;
      await doctor.save();
      fixed++;
    } else if (doctor.image !== filename) {
      console.log(`✓ ${doctor.name} - Updating path from "${doctor.image}" to "${filename}"`);
      doctor.image = filename;
      await doctor.save();
      fixed++;
    } else {
      console.log(`✓ ${doctor.name} - Already correct: ${filename}`);
      skipped++;
    }
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Skipped: ${skipped}`);
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
