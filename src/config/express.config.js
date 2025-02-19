const express = require('express');
const router = require('./router.config')
const app = express()
//if we need to send it to all the five methods we can use use //accepts all the request
app.use("/api/v1", router) //this is the rightway to define the route for versioning


module.exports = app;