const router = require('express').Router();
const AdminStatsRouter = require('../modules/admin-stats/admin-stats.router');
const authRouter = require("../modules/auth/auth.router");  // This is your authRouter
const bannerRouter = require('../modules/banner/banner.router');
const BookingRouter = require('../modules/booking/booking.router');
const closingDayRouter = require('../modules/closing_day/closing_day.router');
const contactUsRouter = require('../modules/contact_us/contact_us.router');
const CourtRouter = require('../modules/court/court.router');
const CreditPointRouter = require('../modules/credit_point/credit_point.router');
const futsalRouter = require('../modules/futsal/futsal.router');
const futsalImageRouter = require('../modules/futsal_image/futsal_image.router');
const slotRouter = require('../modules/slot/slot.router');
const tagRouter = require('../modules/tag/tag.router');
const transactionRouter = require('../modules/transaction/transaction.router');
const VenueStatsRouter = require('../modules/venue-stats/venue-stats.router');

// Route for checking health status
router.use("/health", (req, res) => {
    res.end("This is success.");
});
//mounting all the routes from here 
router.use('/auth', authRouter);

router.use('/banner', bannerRouter);

router.use('/tag', tagRouter);

router.use('/futsal', futsalRouter);


router.use('/futsal-image', futsalImageRouter);

router.use('/court', CourtRouter);

router.use('/slot', slotRouter)

router.use('/closing-day', closingDayRouter);

router.use('/booking', BookingRouter)

router.use('/credit-point', CreditPointRouter)

router.use('/transaction', transactionRouter)

router.use('/contactus', contactUsRouter)
router.use('/admin-stats', AdminStatsRouter)
router.use('/venue-stats', VenueStatsRouter)


// Default route used to check if the api is correct or not 
router.use("/", (req, res) => {
    res.send("Hello world");
});

module.exports = router;
