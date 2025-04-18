const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const venueStatsCtrl = require("./venue-stats.controller");

const VenueStatsRouter = require("express").Router();

VenueStatsRouter.get('/stats', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), venueStatsCtrl.getVenueStats);
VenueStatsRouter.get('/latest-bookings', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), venueStatsCtrl.getLatestBookingsByVenue);
VenueStatsRouter.get('/monthly-revenue', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), venueStatsCtrl.getMonthlyRevenue);
VenueStatsRouter.get('/booking-status', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), venueStatsCtrl.getBookingStatusStats);
VenueStatsRouter.get('/latest-transactions', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), venueStatsCtrl.getLatestTransactions);

module.exports = VenueStatsRouter;