// const mongoose=require('mongoose');
// const adminSchema=mongoose.Schema({
//     email:{
//         type:String,
//         unique:true,
//         required:true
//     },
//     password:{
//         type:String
//     }

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Utility to detect if a value already looks like a bcrypt hash
function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

// Hash password on save
adminSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password') && this.password && !isBcryptHash(this.password)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Hash password on findOneAndUpdate
adminSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate() || {};
    if (update.password && !isBcryptHash(update.password)) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const adminModel = mongoose.model('admin', adminSchema);
module.exports = adminModel;