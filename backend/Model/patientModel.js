const mongoose=require('mongoose');
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

const patientModel=mongoose.model('patient',patientSchema);
module.exports= patientModel;