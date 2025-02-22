require("dotenv").config();
const express = require('express');
const router = require('./router.config')
const app = express()

//json parser
app.use(express.json()); //it will recieve the json data
app.use(express.urlencoded({ //for recieveing urlencoded data 
    extended: false
}))
app.use("/assets", express.static('./public/'))
//form data can't be handled like this as it is route speicific

//if we need to send it to all the five methods we can use use //accepts all the request
app.use("/api/v1", router) //this is the rightway to define the route for versioning

//if the url is not found this response is shown 
//the argument passed in this next is catched by the error on the below function
app.use((req, res, next) => {
    next({
        code: 404, message: "Resource not found", status: "NOT_FOUND"
    });

});
//error handling middleware
app.use((error, req, res, next) => {
    //
    console.log("---------------------------------------Error handler:", error);
    let result = error.detail || null;
    let message = error.message || "Server error...";
    let status = error.status || "INTERNAL_SERVER_ERROR"
    let code = error.code || 500;
    res.status(code).json({
        result: result,
        message: message,
        meta: null,
        status: status
    })
});

module.exports = app;