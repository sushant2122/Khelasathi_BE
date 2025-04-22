require("dotenv").config();
const express = require('express');
require("./db.config"); // for initializing the database 
const router = require('./router.config');
const app = express();
const cors = require("cors");

app.use(cors()) //used for the connection of frontend and backend  cross origin resource sharing 
// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes verisoning
app.use("/api/v1", router);

// Error handling for image
app.use((error, req, res, next) => {
    let result = error.detail || null;
    let message = error.message || "Server error...";
    let status = error.status || "INTERNAL_SERVER_ERROR";
    let code = error.code || 500;

    if (typeof code !== "number") code = 500;

    if (error.code === "LIMIT_FILE_SIZE") {
        code = 400;
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