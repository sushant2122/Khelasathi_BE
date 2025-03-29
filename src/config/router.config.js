const router = require('express').Router();
const authRouter = require("../modules/auth/auth.router");  // This is your authRouter
const bannerRouter = require('../modules/banner/banner.router');
const BookingRouter = require('../modules/booking/booking.router');
const closingDayRouter = require('../modules/closing_day/closing_day.router');
const CourtRouter = require('../modules/court/court.router');
const CreditPointRouter = require('../modules/credit_point/credit_point.router');
const creditSettingRouter = require('../modules/credit_setting/credit_setting.router');
const futsalRouter = require('../modules/futsal/futsal.router');
const futsalImageRouter = require('../modules/futsal_image/futsal_image.router');
const futsalMerchantRouter = require('../modules/futsal_merchant/futsal_merchant.router');
const serviceRouter = require('../modules/service/service.router');
const slotRouter = require('../modules/slot/slot.router');
const tagRouter = require('../modules/tag/tag.router');
const transactionRouter = require('../modules/transaction/transaction.router');

// Route for checking health status
router.use("/health", (req, res) => {
    res.end("This is success.");
});

router.use('/auth', authRouter);

router.use('/banner', bannerRouter);

router.use('/service', serviceRouter);

router.use('/tag', tagRouter);

router.use('/futsal', futsalRouter);

router.use('/futsal-merchant', futsalMerchantRouter);

router.use('/credit-setting', creditSettingRouter);

router.use('/futsal-image', futsalImageRouter);

router.use('/court', CourtRouter);

router.use('/slot', slotRouter)

router.use('/closing-day', closingDayRouter);

router.use('/booking', BookingRouter)

router.use('/credit-point', CreditPointRouter)

router.use('/transaction', transactionRouter)

// Default route
router.use("/", (req, res) => {
    res.send("Hello world");
});

module.exports = router;
