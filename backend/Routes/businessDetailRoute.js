const express = require('express')
const router = express.Router();
const {businessDetails} = require("../Controller/businessDetailController")


router.post("/primary", businessDetails)

module.exports = router