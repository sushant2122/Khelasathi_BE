const router = require('express').Router();
const authRouter = require("../modules/auth/auth.router");  // This is your authRouter
const bannerRouter = require('../modules/banner/banner.router');
const CourtRouter = require('../modules/court/court.router');
const creditSettingRouter = require('../modules/credit_setting/credit_setting.router');
const futsalRouter = require('../modules/futsal/futsal.router');
const futsalImageRouter = require('../modules/futsal_image/futsal_image.router');
const futsalMerchantRouter = require('../modules/futsal_merchant/futsal_merchant.router');
const futsalTagRouter = require('../modules/futsal_tag/futsal_tag.router');
const serviceRouter = require('../modules/service/service.router');
const slotRouter = require('../modules/slot/slot.router');
const slotScheduleRouter = require('../modules/slot_schedule/slot_schedule.router');
const tagRouter = require('../modules/tag/tag.router');

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

router.use('/futsal-tag', futsalTagRouter);

router.use('/court', CourtRouter);

router.use('/slot', slotRouter)

router.use('/slot-schedule', slotScheduleRouter)

// Default route
router.use("/", (req, res) => {
    res.send("Hello world");
});

module.exports = router;
