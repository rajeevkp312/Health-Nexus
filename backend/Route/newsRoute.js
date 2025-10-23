const express=require('express');
const newsModel=require('../Model/newsModel')
const newsRoute=express.Router();

newsRoute.get('',async(req,res)=>{
    try{
        const news=await newsModel.find().lean();
        res.json({"msg":"Success","value":news});
    }

    catch (error){
        console.error('Error fetching news:', error);
        res.status(500).json({"msg": "Error fetching news", "error": error.message})
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
        console.error('Error creating news:', error);
        res.status(500).json({"msg": "Error creating news", "error": error.message})
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
        console.error('Error updating news:', error);
        res.status(500).json({"msg": "Error updating news", "error": error.message})
    }
});


newsRoute.delete('/:id',async(req,res)=>{
    try{
        await newsModel.findByIdAndDelete(req.params.id);
        res.json({"msg":"Success"});
    }

    catch (error){
        console.error('Error deleting news:', error);
        res.status(500).json({"msg": "Error deleting news", "error": error.message})
    }
});



module.exports=newsRoute;