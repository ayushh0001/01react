const ProductModel = require("../Model/productModel");
const CategoryModel = require("../Model/categoryModel");
const { uploadFromBuffer } = require('./uploadController');

const addProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const categoryId = req.body.categoryId; // The deepest category ObjectId sent from frontend
    const categoryPathArr = JSON.parse(req.body.categoryPath);

    // Upload images using separated upload utility
    const uploadPromises = req.files.map((file) =>
      uploadFromBuffer(file.buffer, "ZPIN/productImage")
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Extract URLs
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // Create the product with only the deepest category reference
    const productData = new ProductModel({
      userId,
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      deepestCategoryName: req.body.deepestCategoryName,
      images: imageUrls,
      categoryId, // store only leaf node ID
      categoryPath: categoryPathArr, // array of {name: "category_name"} objects
    });

    console.log("Image URLs array before saving:", imageUrls);
console.log("Product data images field:", productData.images);

    await productData.save();

    res.json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error Adding Product:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};

const getAllUserProduct = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetching products from DB that match this userId
    const products = await ProductModel.find({ userId: userId });
    // Respond with the list of products as JSON
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching user products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductPreview = async (req,res) =>{
  try {
    const {productId} = req.params;
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
        res.status(200).json(product); // Send product details as JSON

  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { addProduct, getAllUserProduct,getProductPreview };
