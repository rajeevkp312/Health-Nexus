const mongoose = require('mongoose');
const doctorModel = require('./Model/doctorModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/healthnexus7', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixDoctorIndex() {
  try {
    console.log('Checking doctor collection indexes...');
    
    // Get all indexes
    const indexes = await doctorModel.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));
    
    // Check if number_1 index exists
    if (indexes.number_1) {
      console.log('Found number_1 index, dropping it...');
      await doctorModel.collection.dropIndex('number_1');
      console.log('Successfully dropped number_1 index');
    } else {
      console.log('No number_1 index found');
    }
    
    // Remove any doctors with null number field to clean up
    const result = await doctorModel.updateMany(
      { number: null },
      { $unset: { number: "" } }
    );
    console.log(`Cleaned up ${result.modifiedCount} doctors with null number field`);
    
    console.log('Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
}

fixDoctorIndex();
