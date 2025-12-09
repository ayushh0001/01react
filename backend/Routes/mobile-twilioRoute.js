

const express = require('express')
const router = express.Router();
const {sendOTP,verifyOTP} = require('../Controller/mobile-twilioController')


router.post('/sendotp',sendOTP)
.post('/verifyotp',verifyOTP )

module.exports = router;
