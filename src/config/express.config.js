const express = require("express");

const app = express()
//if we need to send it to all the five methods we can use use //accepts all the request

app.get("/health", (req, res) => {
    res.end("dfvdfv")
})
app.use("/", (request, response) => {
    response.end("Hello world")
})
module.exports = app;