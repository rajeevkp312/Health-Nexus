const express=require('express');
const newsModel=require('../Model/newsModel')
const newsRoute=express.Router();

newsRoute.get('',async(req,res)=>{
    try{
        const news=await newsModel.find().lean();
        res.json({"msg":"Success","value":news});
    }

    catch (error){
        res.json({"msg":error})
    }
});


newsRoute.post('',async(req,res)=>{
    try{
       const news= await newsModel.create(req.body);
       try {
           const bus = req.app.get('activityBus');
           if (bus) {
               bus.emit('activity', {
                   type: 'news',
                   message: 'Health article published successfully',
                   id: String(news._id || '')
               });
           }
       } catch (_) {}
       res.json({"msg":"Success"});
    }

    catch (error){
        res.json({"msg":error})
    }
});

newsRoute.put('/:id',async(req,res)=>{
    try{
        const updated = await newsModel.findByIdAndUpdate(req.params.id,req.body,{ new: true });
        try {
            const bus = req.app.get('activityBus');
            if (bus && updated) {
                bus.emit('activity', {
                    type: 'news',
                    message: 'Health article updated',
                    id: String(updated._id || '')
                });
            }
        } catch (_) {}
        res.json({"msg":"Success"});
    }

    catch (error){
        res.json({"msg":error})
    }
});


newsRoute.delete('/:id',async(req,res)=>{
    try{
        await newsModel.findByIdAndDelete(req.params.id);
        res.json({"msg":"Success"});
    }

    catch (error){
        res.json({"msg":error})
    }
});



module.exports=newsRoute;