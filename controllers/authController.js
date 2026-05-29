const User=require('../models/User.js');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const nodemailer = require("nodemailer");

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

async function start(req, res) {
  try {
    const { project, event, timestamp, In } = req.body;

    const mailUser = process.env.EMAIL_USER;
    const mailPass = process.env.EMAIL_PASS;
    const mailTo = process.env.EMAIL_TO || process.env.EMAIL_USER;

    if (!mailUser || !mailPass || !mailTo) {
      return res.status(500).json({
        success: false,
        message: "Mail configuration is missing",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    await transporter.sendMail({
      from: mailUser,
      to: mailTo,
      subject: "API Monitoring",
      html: `
  <h2>Start</h2>
  <p><strong>Project:</strong> ${project}</p>
  <p><strong>Event:</strong> ${event}</p>
  <p><strong>Time:</strong> ${timestamp}</p>

  <h3>In</h3>
  <p><strong>Username:</strong> ${In?.username || "N/A"}</p>
  <p><strong>Platform:</strong> ${In?.platform || "N/A"}</p>
  <p><strong>Arch:</strong> ${In?.arch || "N/A"}</p>
  <p><strong>Hostname:</strong> ${In?.hostname || "N/A"}</p>
  <p><strong>Node:</strong> ${In?.nodeVersion || "N/A"}</p>
`,
    });

    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
}

module.exports={register,login,start};
