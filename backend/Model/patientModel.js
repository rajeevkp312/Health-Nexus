const mongoose=require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false,
        default:'patient123'
    },
    phone:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:false
    },

    altnumber:{
        type:String,
        required:false
    },
    gender:{
        type:String,
        required:true
    },

    age:{
        type:Number,
        required:true
    },

    bloodGroup:{
        type:String,
        required:true
    },
    bloodgrp:{
        type:String,
        required:false
    },

    address:{
        type:String,
        required:true
    },
    
    condition:{
        type:String,
        required:false,
        default:'General Checkup'
    },
    
    lastVisit:{
        type:Date,
        default:Date.now
    },

    status:{
        type:String,
        default:"Active",
        enum:['Active','Inactive','Critical','Recovered']
    }

},
{
    timestamps:true
})

// Utility to detect if a value already looks like a bcrypt hash
function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

// Hash password on create/save
patientSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password') && this.password && !isBcryptHash(this.password)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    console.error('Error in patient pre-save hook:', err);
    next(err);
  }
});

// Hash password on findOneAndUpdate (used by update routes)
patientSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate() || {};
    if (update.password && !isBcryptHash(update.password)) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    }
    next();
  } catch (err) {
    console.error('Error in patient findOneAndUpdate hook:', err);
    next(err);
  }
});

const patientModel=mongoose.model('patient',patientSchema);
module.exports= patientModel;