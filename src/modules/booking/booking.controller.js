// booking.controller.js
const { bookingSvc } = require("./booking.service");

class BookingController {
    index = async (req, res, next) => {
        try {
            let page = +req.query.page || 1;
            let limit = +req.query.limit || 10;
            let offset = (page - 1) * limit;

            let filter = { user_id: req.authUser.user_id };

            if (req.query.status) {
                filter.status = req.query.status;
            }

            const { list, total } = await bookingSvc.listAllByFilter({ limit, offset, filter });

            const totalPages = Math.ceil(total / limit);
            if (page > totalPages) {
                return next({
                    code: 404,
                    message: "No data to load for the requested page.",
                    status: "PAGINATION_ERROR"
                });
            }

            res.json({
                result: list,
                meta: {
                    limit,
                    page,
                    total,
                    totalPages
                },
                message: "List all bookings.",
                status: "BOOKING_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };

    creditBooking = async (req, res, next) => {
        try {
            const data = bookingSvc.transformBookingData(req);
            const booking = await bookingSvc.createBookingthroughPoint(data);

            res.json({
                result: booking,
                meta: null,
                message: "Booking created successfully with slots redeeming point.",
                status: "BOOKING_CREATION_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    }

    store = async (req, res, next) => {
        try {
            const data = bookingSvc.transformBookingData(req);
            const booking = await bookingSvc.createBooking(data, req, res);

            res.json({
                result: booking,
                meta: null,
                message: "Booking created successfully with slots.",
                status: "BOOKING_CREATION_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    }

    update = async (req, res, next) => {
        try {
            const booking_id = req.params.id;
            const data = req.body;
            const booking = await bookingSvc.updateBooking(booking_id, data);

            res.json({
                result: booking,
                meta: null,
                message: "Booking updated successfully.",
                status: "BOOKING_UPDATE_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    }

    // Add other methods as needed
    listForHome = async (req, res, next) => {
        try {
            const futsal_id = req.params.id;
            const filter = {
                futsal_id: futsal_id,
                is_available: true
            }
            const tag = await tagSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: tag,
                meta: null,
                message: "tag for display.",
                status: "tag_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }
}

const bookingCtrl = new BookingController();
module.exports = bookingCtrl;