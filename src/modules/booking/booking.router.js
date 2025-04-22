const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");

const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { bookingCreateDTO, bookingUpdateDTO, bookingCancelDTO } = require("./booking.contract");
const bookingCtrl = require("./booking.controller");

const BookingRouter = require("express").Router();

BookingRouter.get('/list-userdetails', loginCheck, bookingCtrl.getUserBookingStats)
BookingRouter.get('/list-home', loginCheck, bookingCtrl.getUserBookingsWithSlots)
BookingRouter.post('/credit-booking', loginCheck, bodyValidator(bookingCreateDTO), bookingCtrl.creditBooking)
BookingRouter.get('/booking-futsal/:futsal_id', loginCheck, checkAccess('Admin'), bookingCtrl.getBookingsByFutsal)
BookingRouter.get('/booking-of-futsal', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), bookingCtrl.getBookingsOfFutsal)

BookingRouter.put('/cancel-booking/:id', loginCheck, bookingCtrl.cancelBooking)
BookingRouter.route('/')
    .get(loginCheck, bookingCtrl.superindex)
    .post(loginCheck, bodyValidator(bookingCreateDTO), bookingCtrl.store)

module.exports = BookingRouter;