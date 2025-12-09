const express = require('express')
const router = express.Router();
const {login,signup,logout,checkAuth,forgetpassword} = require('../Controller/credentialsController')
const authenticateToken = require('../Middleware/tokenauth');


router
.post('/login',login)
.post('/signup',signup )
.post('/logout', authenticateToken,  logout)
.get('/checkAuth', authenticateToken,checkAuth)
.post('/forgetpassword',forgetpassword)


module.exports = router;
