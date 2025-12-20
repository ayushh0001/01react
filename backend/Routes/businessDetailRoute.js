const express = require('express')
const router = express.Router();
const {businessDetails} = require("../Controller/businessDetailController")
const authenticateToken = require('../Middleware/tokenauth');

router.post("/sellerDetails", authenticateToken, businessDetails)

module.exports = router