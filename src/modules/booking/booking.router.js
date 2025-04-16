const { loginCheck } = require("../../middleware/auth.middleware");

const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { bookingCreateDTO, bookingUpdateDTO, bookingCancelDTO } = require("./booking.contract");
const bookingCtrl = require("./booking.controller");

const BookingRouter = require("express").Router();

//BookingRouter.get('/list-home', loginCheck, bookingCtrl.listForHome)

BookingRouter.get('/list-userdetails', loginCheck, bookingCtrl.getUserBookingStats)
BookingRouter.get('/list-home', loginCheck, bookingCtrl.getUserBookingsWithSlots)
BookingRouter.post('/credit-booking', loginCheck, bodyValidator(bookingCreateDTO), bookingCtrl.creditBooking)
BookingRouter.put('/cancel-booking/:id', loginCheck, bookingCtrl.cancelBooking)
BookingRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), bookingCtrl.superindex)
    .post(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), bodyValidator(bookingCreateDTO), bookingCtrl.store)

BookingRouter.route("/:id")
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(bookingUpdateDTO), bookingCtrl.update)

module.exports = BookingRouter;