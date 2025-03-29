const { loginCheck } = require("../../middleware/auth.middleware");

const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { bookingCreateDTO, bookingUpdateDTO } = require("./booking.contract");
const bookingCtrl = require("./booking.controller");

const BookingRouter = require("express").Router();

BookingRouter.get('/list-home/:id', loginCheck, checkAccess(['Admin', 'Venue']), bookingCtrl.listForHome)
BookingRouter.post('/credit-booking', loginCheck, bodyValidator(bookingCreateDTO), bookingCtrl.creditBooking)
BookingRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), bookingCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), bodyValidator(bookingCreateDTO), bookingCtrl.store)

BookingRouter.route("/:id")
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(bookingUpdateDTO), bookingCtrl.update)

module.exports = BookingRouter;