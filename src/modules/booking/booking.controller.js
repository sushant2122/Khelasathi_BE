// booking.controller.js
const { Op } = require("sequelize");
const { Booking, User, Booked_slot, Court, Slot } = require("../../config/db.config");
const { transactionSvc } = require("../transaction/transaction.service");
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

    getFutsalBookingsORM = async (req, res) => {
        try {
            const { futsalId, date } = req.query;

            const where = {
                '$court.futsal_id$': futsalId,
                status: { [Op.not]: 'cancelled' }
            };

            if (date) where.booking_date = date;

            const bookings = await Booking.findAll({
                where,
                include: [
                    {
                        model: User,
                        attributes: ['full_name', 'phone_number']
                    },
                    {
                        model: Booked_slot,
                        as: 'booked_slots', // Add this to match your association
                        include: [{
                            model: Slot,
                            include: [{
                                model: Court,
                                where: { futsal_id: futsalId },
                                attributes: ['court_id', 'title', 'type']
                            }]
                        }]
                    }
                ],
                order: [['booking_date', 'DESC'], ['booked_at', 'DESC']]
            });

            // Format the results
            const formatted = bookings.map(booking => ({
                booking_id: booking.booking_id,
                user_id: booking.user_id,
                booking_date: booking.booking_date,
                booked_at: booking.booked_at,
                status: booking.status,
                total_amount: booking.total_amount,
                user_name: booking.User.full_name,
                user_phone: booking.User.phone_number,
                court_id: booking.booked_slots[0]?.Slot?.Court?.court_id,
                court_title: booking.booked_slots[0]?.Slot?.Court?.title,
                court_type: booking.booked_slots[0]?.Slot?.Court?.type,
                slots: booking.booked_slots.map(bs => ({
                    slot_id: bs.Slot.slot_id,
                    title: bs.Slot.title,
                    start_time: bs.Slot.start_time,
                    end_time: bs.Slot.end_time,
                    price: bs.Slot.price
                }))
            }));

            return res.json({
                result: formatted,
                message: "Bookings retrieved successfully",
                status: "SUCCESS"
            });

        } catch (error) {
            console.error("Error fetching futsal bookings:", error);
            return res.status(500).json({
                message: "Internal server error",
                status: "INTERNAL_SERVER_ERROR"
            });
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

    cancelBooking = async (req, res, next) => {
        let transactiondetail;
        const booking_id = req.params.id;

        try {
            // 1. Validate input
            if (!booking_id) {
                return res.status(400).json({
                    message: "Booking ID is required",
                    status: "MISSING_BOOKING_ID"
                });
            }

            const data = req.body;


            // 2. Get original transaction
            transactiondetail = await transactionSvc.getSingleData({ booking_id });
            if (!transactiondetail) {
                return res.status(404).json({
                    message: "Original transaction not found",
                    status: "TRANSACTION_NOT_FOUND"
                });
            }


            // 3. Validate if already refunded
            if (transactiondetail.payment_status === 'refunded') {
                return res.status(400).json({
                    message: "This transaction was already refunded",
                    status: "ALREADY_REFUNDED"
                });
            }

            // 4. Calculate refund amount (90% of original)
            const refundAmount = Math.round(transactiondetail.total_payment * 0.9); // Ensure 2 decimal places
            console.log("refamt:", refundAmount)
            // 5. Prepare Khalti refund request
            const formdata = {
                mobile: data.mobile,
                amount: refundAmount, // Khalti expects amount in paisa
            };

            // 6. Process refund with Khalti
            const refundResponse = await transactionSvc.refundKhalti(formdata, transactiondetail.payment_session_id);

            console.log("success", refundResponse)

            //remove this part to show the refunded part of khalti
            if (!refundResponse.success) {
                throw {
                    code: 400,
                    message: refundResponse.message || "Refund failed",
                    status: "KHALTI_REFUND_FAILED",
                    details: refundResponse.detail
                };
            }

            // 7. Update booking status
            const booking = await bookingSvc.updateBooking(booking_id, 'cancelled', false);

            // 8. Create refund transaction record
            const transactionData = {
                booking_id,
                total_payment: refundAmount,
                payment_session_id: `${transactiondetail.payment_session_id}_refunded_${Date.now()}`,
                payment_type: "E-Wallet",
                payment_status: "refunded",
                refund_reference: refundResponse.id || null,

            };

            await transactionSvc.createTransaction(transactionData);

            // 9. Return success response
            return res.status(200).json({
                result: {
                    booking,
                    refund: refundResponse,
                    refund_amount: refundAmount
                },
                message: "Booking cancelled and refund processed successfully",
                status: "REFUND_SUCCESS"
            });

        } catch (error) {
            console.error("Error in cancelBooking:", error);

            // Create failed refund record if we have transaction details
            if (transactiondetail && booking_id) {
                try {
                    const failedTransactionData = {
                        booking_id,
                        total_payment: transactiondetail.total_payment * 0.9,
                        payment_session_id: `${transactiondetail.payment_session_id}_refund_failed_${Date.now()}`,
                        payment_type: "E-Wallet",
                        payment_status: "refund-failed", // Use existing enum value
                        error_details: error.details || error.message
                    };

                    await transactionSvc.createTransaction(failedTransactionData);
                } catch (dbError) {
                    console.error("Failed to record failed refund:", dbError);
                }
            }

            // Handle specific error cases
            const statusCode = error.code && Number.isInteger(error.code) ? error.code : 500;
            return res.status(statusCode).json({
                message: error.message || "Internal server error",
                status: error.status || "INTERNAL_SERVER_ERROR",
                details: error.details || null
            });
        }
    };
    // Add other methods as needed
    listForHome = async (req, res, next) => {
        try {
            const user_id = req.authUser.user_id;
            const filter = {
                user_id: user_id,
            }
            const booking = await bookingSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: booking,
                meta: null,
                message: "Booking of a  user.",
                status: "BOOKINGS_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }
}

const bookingCtrl = new BookingController();
module.exports = bookingCtrl;