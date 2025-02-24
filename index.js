const http = require("http");
const app = require("./src/config/express.config")
const server = http.createServer(app)
//access link 127.0.0.1/9005
//if the port is not used but still crashing change the port caching can be the  cause 
//rs to manually restart the server
//the site will be loading untill it responds if requestresponse cycle is not complete
server.listen(9005, "127.0.0.1", (err) => {
    if (!err) {
        console.log("✅ Server is running")
        console.log("✅ ctrl+c to disconnect")
    }
})

//port no. in total 65535