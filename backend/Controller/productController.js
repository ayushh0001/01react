const ProductModel = require("../Model/productModel");
const CategoryModel = require("../Model/categoryModel");
const UserDetailModel = require("../Model/userDetailModel");
const { uploadFromBuffer } = require('./uploadController');
const { getCoordinatesFromPincode } = require('../utils/geocoding');

const addProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(req.user);

    const categoryId = req.body.categoryId; // The deepest category ObjectId sent from frontend
    const categoryPathArr = JSON.parse(req.body.categoryPath);

    // Get seller location from user details
    const userDetails = await UserDetailModel.findOne({ userId });
    let sellerLocation = {};

    if (userDetails) {
      // Get coordinates for the seller's location
      const locationData = await getCoordinatesFromPincode(
        userDetails.pincode,
        userDetails.city,
        userDetails.state
      );

      sellerLocation = {
        city: userDetails.city,
        state: userDetails.state,
        pincode: userDetails.pincode,
        coordinates: {
          type: 'Point',
          coordinates: locationData.coordinates // [lng, lat]
        }
      };
    }

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
      sellerLocation
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

const getAllSellerProduct = async (req, res) => {
  try {
    const userId = req.params.userId;

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
  // seller privew his product
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

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Location-based filtering (25km radius)
    const { lat, lng, city, state, pincode } = req.query;
    let locationFilter = {};

    if (lat && lng) {
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      // Check if coordinates are valid numbers
      if (!isNaN(latitude) && !isNaN(longitude) &&
          latitude >= -90 && latitude <= 90 &&
          longitude >= -180 && longitude <= 180) {
        // Use coordinates for 25km radius search
        locationFilter = {
          'sellerLocation.coordinates': {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], 25 / 6371] // 25km radius
            }
          }
        };
      }
      // If invalid coordinates, fall back to showing all products (no location filter)
    } else if (city) {
      locationFilter['sellerLocation.city'] = new RegExp(city, 'i');
    } else if (state) {
      locationFilter['sellerLocation.state'] = new RegExp(state, 'i');
    } else if (pincode) {
      locationFilter['sellerLocation.pincode'] = pincode;
    }

    const products = await ProductModel.find(locationFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalItems = await ProductModel.countDocuments(locationFilter);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    // Add location info to response when coordinates are used
    const response = {
      products,
      pagination
    };

    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      response.locationInfo = {
        searchRadius: 25,
        userLocation: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        totalNearbyProducts: totalItems
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Location-based filtering
    const { lat, lng, city, state, pincode } = req.query;
    let filter = { categoryId };

    if (lat && lng) {
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      // Check if coordinates are valid numbers
      if (!isNaN(latitude) && !isNaN(longitude) &&
          latitude >= -90 && latitude <= 90 &&
          longitude >= -180 && longitude <= 180) {
        // Use coordinates for 25km radius search
        filter['sellerLocation.coordinates'] = {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], 25 / 6371] // 25km radius
          }
        };
      }
      // If invalid coordinates, fall back to category filter only
    } else if (city) {
      filter['sellerLocation.city'] = new RegExp(city, 'i');
    } else if (state) {
      filter['sellerLocation.state'] = new RegExp(state, 'i');
    } else if (pincode) {
      filter['sellerLocation.pincode'] = pincode;
    }

    const products = await ProductModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalItems = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    // Build response with category and location info
    const response = {
      products,
      pagination,
      categoryInfo: {
        categoryId: categoryId
      }
    };

    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      response.locationInfo = {
        searchRadius: 25,
        userLocation: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        totalNearbyProducts: totalItems
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { addProduct, getAllSellerProduct, getProductPreview, getAllProducts, getProductById, getProductsByCategory };
