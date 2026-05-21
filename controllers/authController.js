const User=require('../models/User.js');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

async function register(req,res){
    try {
        const {name,email,pass,password,userID}=req.body;
        const plainPassword = pass || password;

        const checkUser=await User.findOne({userID});
        if(checkUser)return res.status(400).json({success:false,message:'user already exist'})
        const hash=await bcrypt.hash(plainPassword,10);
        const user=await User.create({
            name,
            email,
            pass:hash,
            userID,
        });
        return res.status(200).json({success:true,message:'user created',user});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}

async function login(req,res){
    try {
        const {userID,pass,password}=req.body;
        const plainPassword = pass || password;

        const user=await User.findOne({userID:userID});
        if(!user)return res.status(404).json({success:false,message:'user not found'});
        const userpass=await bcrypt.compare(plainPassword,user.pass);
        if(!userpass)return res.status(400).json({success:false,message:'pass incorrect'});

        const token=jwt.sign({
            id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        );
        return res.status(200).json({success:true,message:'login ..',token});
    } catch (error) {
        return res.status(500).json({success:false,message:error.message})
    }
}
module.exports={register,login};
