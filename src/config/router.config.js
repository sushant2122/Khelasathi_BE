const router = require('express').Router();
const authRouter = require("../modules/auth/auth.router");  // This is your authRouter

// Route for checking health status
router.use("/health", (req, res) => {
    res.end("This is success.");
});

// Use the authRouter for authentication-related routes
router.use('/auth', authRouter);  // This will handle all the routes defined in 'auth.router.js'

// Default route
router.use("/", (req, res) => {
    res.send("Hello world");
});

module.exports = router;
