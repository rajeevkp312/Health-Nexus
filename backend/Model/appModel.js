const mongoose=require('mongoose')
const appSchema=mongoose.Schema({
    pid: {
        type: String,
        required: true
    },
    did: {
        type: String,
        required: true
    },
    
    // Patient information (for easier access)
    patientName:{
        type:String,
        required:false
    },
    patientEmail:{
        type:String,
        required:false
    },
    patientPhone:{
        type:String,
        required:false
    },
    patientAge:{
        type:Number,
        required:false
    },
    patientGender:{
        type:String,
        required:false
    },
    patientBloodGroup:{
        type:String,
        required:false
    },
    patientAddress:{
        type:String,
        required:false
    },
    
    //Doctor information (for easier access)
    doctorName:{
        type:String,
        required:false
    },
    specialty:{
        type:String,
        required:false
    },

    date:{
        type:Date,
        required:true
    },

    time:{
        type:String,
        required:false
    },
    slot:{
        type:String,
        required:false
    },

    reason:{
        type:String,
        required:true,
        default:'General Consultation'
    },
    description:{
        type:String,
        required:false
    },
    
    notes:{
        type:String,
        required:false
    },

    status:{
        type:String,
        enum:["Scheduled","Confirmed","Cancelled","Completed"],
        default:"Scheduled"
    }

},{
    timestamps:true
});
// Indexes for frequent queries
appSchema.index({ did: 1, status: 1, date: -1 });
appSchema.index({ pid: 1, status: 1, date: -1 });
appSchema.index({ createdAt: -1 });
const appModel=mongoose.model('app',appSchema);
module.exports =appModel;