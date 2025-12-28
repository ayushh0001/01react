const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadImage = async (req, res) => {
  try {
    const { type } = req.body;

    // Check if files exist (handles both single and multiple files)
    const files = req.files || (req.file ? [req.file] : null);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided"
      });
    }

    // Define folder mapping
    const folderMap = {
      profile: "ZPIN/profileImage",
      product: "ZPIN/products",
      category: "ZPIN/categories"
    };

    const folder = folderMap[type] || "ZPIN/misc";

    // Handle multiple files
    const uploadPromises = files.map(file => uploadFromBuffer(file.buffer, folder));
    const uploadResults = await Promise.all(uploadPromises);

    // Format response based on single or multiple files
    const responseData = uploadResults.length === 1
      ? {
          imageUrl: uploadResults[0].secure_url,
          publicId: uploadResults[0].public_id
        }
      : {
          images: uploadResults.map(result => ({
            imageUrl: result.secure_url,
            publicId: result.public_id
          }))
        };

    res.status(200).json({
      success: true,
      message: `${uploadResults.length} image(s) uploaded successfully`,
      data: responseData
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image(s)"
    });
  }
};

module.exports = { uploadImage, uploadFromBuffer };