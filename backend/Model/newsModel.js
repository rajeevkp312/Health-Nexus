const mongoose=require('mongoose');
const newsSchema=mongoose.Schema({
   title:{
       type:String,
       required:true
   },
   content:{
       type:String,
       required:true
   },
   desc:{
       type:String,
       required:false
   },
   category:{
       type:String,
       required:true,
       enum:['Health Tips','Medical Research','Hospital News','Community Health','Technology']
   },
   author:{
       type:String,
       required:true
   },
   image:{
       type:String,
       required:false
   },
   publishDate:{
       type:Date,
       default:Date.now
   },
   views:{
       type:Number,
       default:0
   },
   status:{
    type:String,
    default:"draft",
    enum:['draft','published','archived']
   }

},
{
    timestamps:true
})

// Indexes for common queries
newsSchema.index({ createdAt: -1 });
newsSchema.index({ category: 1, status: 1, publishDate: -1 });

const newsModel=mongoose.model('news',newsSchema);
module.exports= newsModel;