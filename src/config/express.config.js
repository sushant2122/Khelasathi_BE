require("dotenv").config();
const express = require('express');
require("./db.config")
const router = require('./router.config')
const app = express()
//json parser
app.use(express.json()); //it will recieve the json data
app.use(express.urlencoded({ //for recieveing urlencoded data 
    extended: false
}))
// app.use("/assets", express.static('./public/'))
//form data can't be handled like this as it is route speicific

//if we need to send it to all the five methods we can use use //accepts all the request
app.use("/api/v1", router) //this is the rightway to define the route for versioning


//if the url is not found this response is shown 
//the argument passed in this next is catched by the error on the below function

//error handling middleware
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