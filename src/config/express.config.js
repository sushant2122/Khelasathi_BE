require("dotenv").config();
const express = require('express');
require("./db.config");
const router = require('./router.config');
const app = express();

// json parser
app.use(express.json()); // it will receive the json data
app.use(express.urlencoded({ // for receiving urlencoded data
    extended: false
}));

// Use versioned routes
app.use("/api/v1", router); // this is the right way to define the route for versioning

// Error handling middleware
app.use((error, req, res, next) => {
    let result = error.detail || null;
    let message = error.message || "Server error...";
    let status = error.status || "INTERNAL_SERVER_ERROR";
    let code = error.code || 500;

    // 🛑 Fix: Ensure `code` is a valid HTTP status
    if (typeof code !== "number") {
        code = 500; // Default to Internal Server Error
    }

    // ✅ Handle Multer-specific errors
    if (error.code === "LIMIT_FILE_SIZE") {
        code = 400; // Bad Request
        message = "File size exceeds the allowed limit.";
        status = "LIMIT_FILE_SIZE";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        code = 400;
        message = "Unexpected file format.";
        status = "LIMIT_UNEXPECTED_FILE";
    }


    res.status(code).json({
        result: result,
        message: message,
        meta: null,
        status: status
    });
});

module.exports = app;
