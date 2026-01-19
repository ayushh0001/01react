const express = require('express')
const router = express.Router();
const {addProduct,getAllSellerProduct,getProductPreview,getAllProducts,getProductById,getProductsByCategory} = require('../Controller/productController')
const upload = require('../config/multer');
const authenticateToken = require('../Middleware/tokenauth');



// Using multer middleware on the route to accept multiple images with field name 'images'
router.post("/addProduct",authenticateToken,upload.array('images', 10),addProduct )
.get("/seller/:userId", getAllSellerProduct)
.get("/productPreview/:productId",getProductPreview )
.get("/category/:categoryId", getProductsByCategory)
.get("/", getAllProducts)
.get("/:id", getProductById)

module.exports = router