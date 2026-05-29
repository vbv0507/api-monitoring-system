const express=require('express');
const router=express.Router();
const {register,login,start}=require('../controllers/authController.js');

router.post('/register',register);
router.post('/login',login);
router.post('/start',start);
module.exports=router;