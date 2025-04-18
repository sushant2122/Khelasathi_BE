const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const adminStatsCtrl = require("./admin-stats.controller");

const AdminStatsRouter = require("express").Router();

//BookingRouter.get('/list-home', loginCheck, bookingCtrl.listForHome)

AdminStatsRouter.get('/list-adminstats', loginCheck, checkAccess('Admin'), adminStatsCtrl.getAdminStats)
AdminStatsRouter.get('/top-venue', loginCheck, checkAccess('Admin'), adminStatsCtrl.getTopBookingsByVenue)

AdminStatsRouter.get('/monthly-revenue', loginCheck, checkAccess('Admin'), adminStatsCtrl.getMonthlyRevenue)
AdminStatsRouter.get('/booking-status', loginCheck, checkAccess('Admin'), adminStatsCtrl.getBookingStatusStats)

AdminStatsRouter.get('/latest-transaction', loginCheck, checkAccess('Admin'), adminStatsCtrl.getLatestTransactions)




//AdminStatsRouter.get('/credit-booking', loginCheck, bookingCtrl.)
module.exports = AdminStatsRouter;