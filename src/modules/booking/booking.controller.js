// booking.controller.js
const { Op } = require("sequelize");
const { Booking, User, Booked_slot, Court, Slot, sequelize } = require("../../config/db.config");
const { transactionSvc } = require("../transaction/transaction.service");
const { bookingSvc } = require("./booking.service");

class BookingController {
    superindex = async (req, res, next) => {
        try {
            let page = +req.query.page || 1;
            let limit = +req.query.limit || 10;
            let offset = (page - 1) * limit;

            let filter = {};

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

    cancelBooking = async (req, res, next) => {
        let transactiondetail;
        const booking_id = req.params.id;

        try {

            if (!booking_id) {
                return res.status(400).json({
                    message: "Booking ID is required",
                    status: "MISSING_BOOKING_ID"
                });
            }

            const data = req.body;



            transactiondetail = await transactionSvc.getSingleData({ booking_id });
            if (!transactiondetail) {
                return res.status(404).json({
                    message: "Original transaction not found",
                    status: "TRANSACTION_NOT_FOUND"
                });
            }



            if (transactiondetail.payment_status === 'refunded') {
                return res.status(400).json({
                    message: "This transaction was already refunded",
                    status: "ALREADY_REFUNDED"
                });
            }

            //  Calculate refund amount (90% of original)
            const refundAmount = Math.round(transactiondetail.total_payment * 0.9); // Ensure 2 decimal places
            console.log("refamt:", refundAmount)
            // 5. Prepare Khalti refund request
            const formdata = {
                mobile: req.authUser.contact_number,
                amount: refundAmount,
            };


            // 6. Process refund with Khalti
            const refundResponse = await transactionSvc.refundKhalti(formdata, transactiondetail.payment_session_id);



            //remove this part to show the refunded part of khalti
            // if (!refundResponse.success) {
            //     throw {
            //         code: 400,
            //         message: refundResponse.message || "Refund failed",
            //         status: "KHALTI_REFUND_FAILED",
            //         details: refundResponse.detail
            //     };
            // }

            //  Update booking status
            const booking = await bookingSvc.updateBooking(booking_id, 'cancelled', false);

            //  Create refund transaction record
            const transactionData = {
                booking_id,
                total_payment: refundAmount,
                payment_session_id: `${transactiondetail.payment_session_id}_refunded_${Date.now()}`,
                payment_type: "E-Wallet",
                payment_status: "refunded",
                refund_reference: refundResponse.id || null,

            };

            await transactionSvc.createTransaction(transactionData);

            //  Return success response
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


    getUserBookingsWithSlots = async (req, res, next) => {
        try {
            const userId = req.authUser.user_id;
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 10; // Default 10 items per page

            if (!userId) {
                return res.status(400).json({
                    result: null,
                    message: "Missing required parameter: userId.",
                    status: "BAD_REQUEST"
                });
            }


            const countQuery = `
                SELECT COUNT(DISTINCT b.booking_id) as total
                FROM "Bookings" b
                JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN "Slots" s ON bs.slot_id = s.slot_id
                JOIN "Courts" c ON s.court_id = c.court_id
                JOIN "Futsals" f ON c.futsal_id = f.futsal_id
                WHERE b.user_id = :userId
            `;

            const countResult = await sequelize.query(countQuery, {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
                raw: true
            });

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;

            const query = `
                SELECT 
                    b.booking_id,
                    b.booking_date,
                    b.booked_at,
                    b.remarks,
                    b.is_paid,
                    b.total_amount,
                    b.total_points_collected,
                    b.status,
                    f.futsal_id,
                    f.name AS futsal_name,
                    f.location AS futsal_location,
                    f.contact_number AS futsal_contact,
                    (
                        SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'slot_id', s.slot_id,
                                'title', s.title,
                                'start_time', s.start_time,
                                'end_time', s.end_time,
                                'price', s.price,
                                'credit_point', s.credit_point,
                                'court_id', c.court_id,
                                'court_title', c.title,
                                'court_type', c.type
                            )
                        )
                        FROM "Booked_slots" bs
                        JOIN "Slots" s ON bs.slot_id = s.slot_id
                        JOIN "Courts" c ON s.court_id = c.court_id
                        WHERE bs.booking_id = b.booking_id
                    ) AS slots
                FROM "Bookings" b
                JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN "Slots" s ON bs.slot_id = s.slot_id
                JOIN "Courts" c ON s.court_id = c.court_id
                JOIN "Futsals" f ON c.futsal_id = f.futsal_id
                WHERE b.user_id = :userId
                GROUP BY 
                    b.booking_id,
                    f.futsal_id
                    
                ORDER BY  b.booked_at DESC
                LIMIT :limit OFFSET :offset;
            `;

            const results = await sequelize.query(query, {
                replacements: { userId, limit, offset },
                type: sequelize.QueryTypes.SELECT,
                raw: true,
                nest: true,
                mapToModel: false
            });

            if (!results || results.length === 0) {
                return res.status(404).json({
                    result: [],
                    message: "No bookings found for this user.",
                    status: "NOT_FOUND"
                });
            }

            const formattedResults = results.map(booking => ({
                ...booking,
                slots: booking.slots || []
            }));

            res.json({
                result: {
                    list: formattedResults,
                    pagination: {
                        total,
                        totalPages,
                        currentPage: page,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                },
                meta: null,
                message: "User bookings with slots fetched successfully.",
                status: "BOOKINGS_FETCHED"
            });

        } catch (exception) {
            next(exception);
        }
    };

    getUserBookingStats = async (req, res, next) => {
        try {
            const userId = req.authUser.user_id;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                });
            }


            const totalBookings = await Booking.count({
                where: { user_id: userId }
            });


            const cancelledBookings = await Booking.count({
                where: {
                    user_id: userId,
                    status: 'cancelled'
                }
            });


            const totalSlotsBooked = await Booked_slot.count({
                include: [{
                    model: Booking,
                    where: { user_id: userId },
                    attributes: []
                }]
            });

            res.json({
                result: {
                    totalBookings,
                    cancelledBookings,
                    totalSlotsBooked
                },
                message: 'Booking statistics retrieved successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    getBookingsByFutsal = async (req, res, next) => {
        try {
            // Validate and parse parameters
            const { futsal_id } = req.params;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const offset = (page - 1) * limit;
            const futsalId = parseInt(futsal_id, 10);
            const query = `
                WITH booking_data AS (
                    SELECT 
                        b.booking_id,
                        b.booking_date,
                        b.status,
                        b.total_amount,
                        u.full_name AS customer_name,
                        u.email AS customer_email,
                        json_agg(
                            json_build_object(
                                'slot_id', s.slot_id,
                                'title', s.title,
                                'start_time', s.start_time,
                                'end_time', s.end_time,
                                'price', s.price,
                                'court_title', c.title
                            )
                        ) AS booked_slots,
                        COUNT(*) OVER() AS total_count
                    FROM "Bookings" b
                    JOIN "Users" u ON b.user_id = u.user_id
                    JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                    JOIN "Slots" s ON bs.slot_id = s.slot_id
                    JOIN "Courts" c ON s.court_id = c.court_id
                    WHERE c.futsal_id = :futsalId
                    GROUP BY b.booking_id, u.full_name, u.email
                    ORDER BY b.booking_date DESC
                    LIMIT :limit OFFSET :offset
                )
                SELECT * FROM booking_data;
            `;

            const results = await sequelize.query(query, {
                replacements: {
                    futsalId,
                    limit,
                    offset
                },
                type: sequelize.QueryTypes.SELECT
            });


            const response = {
                success: true,
                data: results.map(booking => ({
                    ...booking,
                    booked_slots: booking.booked_slots || []
                })),
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_items: results[0]?.total_count || 0,
                    total_pages: Math.ceil((results[0]?.total_count || 0) / limit)
                }
            };

            return res.json(response);

        } catch (error) {
            next(error);
        }
    };

    getBookingsOfFutsal = async (req, res, next) => {
        try {
            //  Validate and parse parameters
            const futsalId = req.authUser.futsal_id;
            console.log(req.authUser);
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const offset = (page - 1) * limit;



            //  Main query using parameterized queries
            console.log("futsalid", futsalId)
            const query = `
                WITH booking_data AS (
                    SELECT 
                        b.booking_id,
                        b.booking_date,
                        b.status,
                        b.total_amount,
                        u.full_name AS customer_name,
                        u.email AS customer_email,
                        json_agg(
                            json_build_object(
                                'slot_id', s.slot_id,
                                'title', s.title,
                                'start_time', s.start_time,
                                'end_time', s.end_time,
                                'price', s.price,
                                'court_title', c.title
                            )
                        ) AS booked_slots,
                        COUNT(*) OVER() AS total_count
                    FROM "Bookings" b
                    JOIN "Users" u ON b.user_id = u.user_id
                    JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                    JOIN "Slots" s ON bs.slot_id = s.slot_id
                    JOIN "Courts" c ON s.court_id = c.court_id
                    WHERE c.futsal_id = :futsalId
                    GROUP BY b.booking_id, u.full_name, u.email
                    ORDER BY b.booking_date DESC
                    LIMIT :limit OFFSET :offset
                )
                SELECT * FROM booking_data;
            `;

            const results = await sequelize.query(query, {
                replacements: {
                    futsalId,
                    limit,
                    offset
                },
                type: sequelize.QueryTypes.SELECT
            });


            const response = {
                success: true,
                data: results.map(booking => ({
                    ...booking,
                    booked_slots: booking.booked_slots || []
                })),
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_items: results[0]?.total_count || 0,
                    total_pages: Math.ceil((results[0]?.total_count || 0) / limit)
                }
            };

            return res.json(response);

        } catch (error) {
            next(error);
        }
    };

}

const bookingCtrl = new BookingController();
module.exports = bookingCtrl;