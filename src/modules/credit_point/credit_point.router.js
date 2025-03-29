const { loginCheck } = require("../../middleware/auth.middleware");
const { creditpointCtrl } = require("./credit_point.controller");

const CreditPointRouter = require("express").Router();

CreditPointRouter.get('/view-point', loginCheck, creditpointCtrl.calculatePoint)

CreditPointRouter.get('/list-home', loginCheck, creditpointCtrl.listForHome)

// BookingRouter.route('/')
//     .get(loginCheck, checkAccess(['Admin', 'Venue']), bookingCtrl.index)
//     .post(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), bodyValidator(bookingCreateDTO), bookingCtrl.store)
// BookingRouter.route("/:id")
//     .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(bookingUpdateDTO), bookingCtrl.update)

module.exports = CreditPointRouter;