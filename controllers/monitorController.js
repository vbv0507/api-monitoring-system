const Monitor = require('../models/Monitor');
async function createMonitor(req,res){
    try {
        const {url,method,interval}=req.body;
        const monitor=await Monitor.create({
            url,
            method,
            interval,
            user: req.user._id,
        });
        res.status(201).json({success:true,monitor});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}
async function getMonitors(req,res){
    try {
        const monitor=await Monitor.find({ user: req.user._id });
        res.status(200).json({success:true,monitor});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}
async function deleteMonitor(req,res){
    try {
        const monitor=await Monitor.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if(!monitor){
            return res.status(404).json({success:false,message:'Monitor not found'});
        }
        res.status(200).json({success:true,message:'Monitor deleted'});
    } catch (error) {
        return res.status(500).json({success:false,message:error.message});
    }
}
module.exports={createMonitor,getMonitors,deleteMonitor};
