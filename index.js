const http = require("http");
const app = require("./src/config/express.config")
const { Server } = require('socket.io')
const server = http.createServer(app)
const io = new Server(server, {
    cors: "*"
})
io.on("connection", (socket) => {
    socket.on('NewBookingthroughcash', (data) => {
        socket.broadcast.emit("recievedslotdatacash", data)
    })
    socket.on('NewBookingthroughpoint', (data) => {
        socket.broadcast.emit("recievedslotdatapoint", data)
    })
})
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