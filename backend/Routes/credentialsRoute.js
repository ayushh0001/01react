const express = require('express')
const router = express.Router();
const {login,signup,logout,checkAuth,userDetail,getAllUsers,getUserById,updateProfileDetail} = require('../Controller/credentialsController')
const {sendOTP,verifyOTP,forgetPasswordSendOTP,forgetPasswordVerifyOTP,forgetPasswordResetPassword} = require('../Controller/mobile-twilioController')
const authenticateToken = require('../Middleware/tokenauth');
const upload = require("../config/multer")


router
.post('/login',login)
.post('/signup',signup )
.post('/logout', authenticateToken,  logout)
.get('/checkAuth', authenticateToken,checkAuth)
.post('/verification/sendOTP',sendOTP)
.post('/verification/verifyOTP',verifyOTP )
.post('/forgetPassword/sendOTP', forgetPasswordSendOTP)
.post('/forgetPassword/verifyOTP', forgetPasswordVerifyOTP)
.post('/forgetPassword/resetPassword', forgetPasswordResetPassword)
.post('/profileDetails', authenticateToken, upload.single('profileImage'), userDetail )
.get('/users', getAllUsers)
.get('/users/:id', getUserById)
.put('/profileDetails', authenticateToken, upload.single('profileImage'), updateProfileDetail)

module.exports = router;
