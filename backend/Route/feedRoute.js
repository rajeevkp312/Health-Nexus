const express=require('express');
const feedModel=require('../Model/feedModel');
const feedRoute=express.Router();


feedRoute.post('',async(req,res)=>{
    try{
        const feed=await feedModel.create(req.body);
        // Emit activity: new feedback
        try {
            const bus = req.app.get('activityBus');
            if (bus) {
                bus.emit('activity', {
                    type: 'feedback',
                    message: 'New feedback received from patient',
                    id: String(feed._id || '')
                });
            }
        } catch (_) {}
        res.json({"msg":"Success"});
    }

    catch (error){
        console.error('Error creating feedback:', error);
        res.status(500).json({"msg": "Error creating feedback", "error": error.message})
    }
});


// Get feedback for a specific doctor
feedRoute.get('/doctor/:did', async (req, res) => {
    try{
        const did = req.params.did;
        const feed = await feedModel.find({ did }).sort({ createdAt: -1 }).lean();
        res.json({ msg: 'Success', value: feed });
    }catch(error){
        console.error('Error fetching doctor feedback:', error);
        res.status(500).json({ msg: "Error fetching feedback", error: error.message });
    }
});

feedRoute.put('/:id',async(req,res)=>{
    try{
        const updated = await feedModel.findByIdAndUpdate(req.params.id,req.body,{ new: true });
        // Emit activity: feedback updated (e.g., status changed)
        try {
            const bus = req.app.get('activityBus');
            if (bus && updated) {
                bus.emit('activity', {
                    type: 'feedback',
                    message: `Feedback ${updated.status ? updated.status : 'updated'}`,
                    id: String(updated._id || '')
                });
            }
        } catch (_) {}
        res.json({"msg":"Success"});
    }

    catch (error){
        console.error('Error updating feedback:', error);
        res.status(500).json({"msg": "Error updating feedback", "error": error.message})
    }
});


feedRoute.get('/user/:id',async(req,res)=>{
    try{
        const feed=await feedModel.find({uid:req.params.id}).lean();
        res.json({"msg":"Success","value":feed});
    }

    catch (error){
        console.error('Error fetching user feedback:', error);
        res.status(500).json({"msg": "Error fetching feedback", "error": error.message})
    }
});


feedRoute.delete('/:id',async(req,res)=>{
    try{
        await feedModel.findByIdAndDelete(req.params.id);
        res.json({"msg":"Success"});
    }

    catch (error){
        console.error('Error deleting feedback:', error);
        res.status(500).json({"msg": "Error deleting feedback", "error": error.message})
    }
});



feedRoute.get('',async(req,res)=>{
    try{
        const feed=await feedModel.find().populate('uid').lean();
        res.json({"msg":"Success","value":feed});
    }

    catch (error){
        console.error('Error fetching all feedback:', error);
        res.status(500).json({"msg": "Error fetching feedback", "error": error.message})
    }
});


module.exports=feedRoute;