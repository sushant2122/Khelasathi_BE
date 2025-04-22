// Import required modules
const multer = require("multer"); // Middleware for handling multipart/form-data (file uploads)
const cloudinary = require("cloudinary").v2; // Cloudinary SDK for v2 API (image/video management service)

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name from environment
    api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key from environment
    api_secret: process.env.CLOUDINARY_API_SECRET // Cloudinary API secret from environment
});

// Configure Multer to store files in memory (Buffer) rather than disk
const storage = multer.memoryStorage(); // Creates a storage engine that keeps files in memory as Buffers

// Create a Multer instance configured for temporary in-memory uploads
const tmpUpload = multer({
    storage // Uses the memory storage configuration

});

// Export the configured modules
module.exports = {
    tmpUpload,
    cloudinary
};