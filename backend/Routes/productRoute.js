const express = require('express')
const router = express.Router();
const {addProduct,getAllUserProduct,getProductPreview} = require('../Controller/productController')
const upload = require('../config/multer');




// Using multer middleware on the route to accept multiple images with field name 'images'
router.post("/addProduct",upload.array('images', 10),addProduct )
.get("/getAllUserProduct", getAllUserProduct)
.get("/productPreview/:productId",getProductPreview )

module.exports = router