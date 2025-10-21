const mongoose=require('mongoose');
const feedSchema=mongoose.Schema({
    uid:{
        type:String,
        refPath:"utype"
    },
    // Optional: doctor this feedback is about
    did:{
        type:String,
        required:false
    },
    utype:{
        type:String,
        required:true,
        default:"patient"
    },
    type:{
        type:String,
        required:true
    },
    msg:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:false
    },
    // Optional response from admin/doctor
    response:{
        type:String,
        required:false
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        default:5
    },
    status:{
        type:String,
        default:"pending",
        enum:['pending','reviewed','resolved']
    },
    // Mark as important/starred
    important:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
})

// Indexes for frequent queries
feedSchema.index({ uid: 1, type: 1, createdAt: -1 });
feedSchema.index({ did: 1, createdAt: -1 });

const feedModel=mongoose.model('feedback',feedSchema);
module.exports= feedModel;