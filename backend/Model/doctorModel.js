const mongoose=require('mongoose')
const bcrypt = require('bcryptjs')
const doctorSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    number:{
        type:String,
        required:false
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:false,
        default: 'doctor123'
    },

    gender:{
        type:String,
        required:false,
    },

    qualification:{
        type:String,
        required:true,
    },
    qua:{
        type:String,
        required:false,
    },

    experience:{
        type:String,
        required:true,
    },
    exp:{
        type:String,
        required:false,
    },
    
    specialty:{
        type:String,
        required:true,
    },
    spe:{
        type:String,
        required:false,
    },

    address:{
        type:String,
        required:false,
    },
    
    consultationFee:{
        type:Number,
        required:false,
        default: 150
    },
    
    availableDays:{
        type:[String],
        required:false,
        default:['Monday','Tuesday','Wednesday','Thursday','Friday']
    },
    
    availableTime:{
        type:String,
        required:false,
        default:'9:00 AM - 5:00 PM'
    },
    
    bio:{
        type:String,
        required:false
    },
    
    image:{
        type:String,
        required:false
    },
    
    status:{
        type:String,
        default: 'active',
        enum:['active','inactive','pending']
    }
}, {
    timestamps:true
});

// Utility to detect if a value already looks like a bcrypt hash
function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

// Hash password on create/save
doctorSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password') && this.password && !isBcryptHash(this.password)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    console.error('Error in doctor pre-save hook:', err);
    next(err);
  }
});

// Hash password on findOneAndUpdate (used by update routes)
doctorSchema.pre('findOneAndUpdate', async function(next) {
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

// Indexes for frequent queries
doctorSchema.index({ specialty: 1, status: 1 });
doctorSchema.index({ createdAt: -1 });

const doctorModel=mongoose.model('doctor',doctorSchema);
module.exports =doctorModel