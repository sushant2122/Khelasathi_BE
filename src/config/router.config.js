const router = require('express').Router();
const authRouter = require("../modules/auth/auth.router");  // This is your authRouter
const bannerRouter = require('../modules/banner/banner.router');
const futsalRouter = require('../modules/futsal/futsal.router');
const serviceRouter = require('../modules/service/service.router');
const tagRouter = require('../modules/tag/tag.router');

// Route for checking health status
router.use("/health", (req, res) => {
    res.end("This is success.");
});

// Use the authRouter for authentication-related routes


router.use('/auth', authRouter);  // This will handle all the routes defined in 'auth.router.js'

router.use('/banner', bannerRouter);// This will handle all the routes defined in 'banner.router.js'

router.use('/service', serviceRouter);

router.use('/tag', tagRouter);

router.use('/futsal', futsalRouter);
// Default route
router.use("/", (req, res) => {
    res.send("Hello world");
});

module.exports = router;
