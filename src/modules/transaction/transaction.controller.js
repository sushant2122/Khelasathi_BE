const axios = require('axios');
const { bookingSvc } = require('../booking/booking.service');
const { transactionSvc } = require('./transaction.service');
const { Op } = require('sequelize'); // Make sure to import Op if using Sequelize
const { Booking, sequelize, Transaction } = require('../../config/db.config');
const { creditSvc } = require('../credit_point/credit_point.service');

class TransactionController {
    constructor() {
        // Initialize the periodic check when the controller is instantiated
        this.setupStaleBookingChecker();
    }

    index = async (req, res, next) => {
        try {
            let page = +req.query.page || 1;
            let limit = +req.query.limit || 10;
            let offset = (page - 1) * limit; // `offset` in Sequelize is equivalent to `skip`

            let filter = {};

            // Fetch the list and total count of transactions
            const { list, total } = await transactionSvc.listAllByFilter({ limit, offset });

            // Check if the requested page exceeds the total available pages
            const totalPages = Math.ceil(total / limit);
            if (page > totalPages && totalPages > 0) {
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
                    totalpages: totalPages
                },
                message: "List all transactions.",
                status: "TRANSACTION_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };
    async addTransaction(req, res, next) {
        const t = await Transaction.sequelize.transaction();
        try {
            const { pidx, amount, purchase_order_id, transaction_id, message } = req.body;
            console.log('Transaction data:', { pidx, amount, purchase_order_id, transaction_id, message });

            // 1. Initial validation
            if (message) {
                await t.rollback();
                return res.status(400).json({
                    result: message,
                    message: "Error processing Khalti payment",
                    status: "KHALTI_BAD_REQUEST"
                });
            }

            if (!purchase_order_id || !pidx) {
                await t.rollback();
                return res.status(400).json({
                    message: "Missing required parameters",
                    status: "MISSING_PARAMETERS"
                });
            }

            // 2. Khalti payment verification
            const headers = {
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            };

            let khaltiResponse;
            try {
                khaltiResponse = await axios.post(
                    "https://a.khalti.com/api/v2/epayment/lookup/",
                    { pidx },
                    { headers }
                );
                console.log("Khalti verification response:", khaltiResponse.data);
            } catch (axiosError) {
                console.error("Khalti API Error:", axiosError.response?.data || axiosError.message);

                const transactionData = {
                    booking_id: purchase_order_id,
                    total_payment: amount ? amount / 100 : 0,
                    payment_session_id: pidx,
                    payment_type: "E-Wallet",
                    payment_status: "failed",
                    error_details: axiosError.response?.data || { error: axiosError.message }
                };

                await transactionSvc.createTransaction(transactionData, { transaction: t });
                await bookingSvc.updateBooking(purchase_order_id, "cancelled", false, { transaction: t });
                await t.commit();

                return res.status(400).json({
                    message: "Payment verification failed",
                    error: axiosError.response?.data || axiosError.message,
                    status: "KHALTI_VERIFICATION_FAILED"
                });
            }

            // 3. Handle payment status
            if (khaltiResponse.data.status !== "Completed") {
                const transactionData = {
                    booking_id: purchase_order_id,
                    total_payment: khaltiResponse.data.total_amount / 100,
                    payment_session_id: pidx,
                    payment_type: "E-Wallet",
                    payment_status: "failed",
                    error_details: khaltiResponse.data
                };

                await transactionSvc.createTransaction(transactionData, { transaction: t });
                await bookingSvc.updateBooking(purchase_order_id, "cancelled", false, { transaction: t });
                await t.commit();

                return res.status(400).json({
                    result: khaltiResponse.data,
                    message: "Payment not completed",
                    status: "PAYMENT_NOT_COMPLETED"
                });
            }

            // 4. Process successful payment
            const updatedBooking = await bookingSvc.updateBooking(
                purchase_order_id,
                "completed",
                true,
                { transaction: t }
            );

            const transactionData = {
                booking_id: purchase_order_id,
                total_payment: khaltiResponse.data.total_amount / 100,
                payment_session_id: khaltiResponse.data.transaction_id,
                payment_type: "E-Wallet",
                payment_status: "paid",
            };

            const transaction = await transactionSvc.createTransaction(transactionData, { transaction: t });

            try {
                const query = `
                    SELECT 
                        b.user_id,
                        COUNT(bs.booked_slot_id) AS total_slots
                    FROM "Bookings" b
                    JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                    JOIN "Users" u ON b.user_id = u.user_id
                    WHERE b.booking_id = :purchase_order_id 
                    GROUP BY b.user_id, b.total_amount, b.status, u.full_name
                `;

                const results = await sequelize.query(query, {
                    replacements: { purchase_order_id },
                    type: sequelize.QueryTypes.SELECT,
                    transaction: t
                });

                if (results?.length > 0 && results[0].user_id && results[0].total_slots) {
                    const total_points = results[0].total_slots * 10;
                    const { user_id } = results[0];


                    await creditSvc.earnPoint(user_id, purchase_order_id, total_points, { transaction: t });
                } else {

                }
            } catch (pointsError) {

            }

            await t.commit();

            return res.status(200).json({
                message: "Payment processed successfully",
                status: "PAYMENT_SUCCESS",
                booking: updatedBooking,
                transaction: transaction
            });

        } catch (error) {
            await t.rollback();
            console.error("Transaction processing error:", error);

            if (error.response?.data) {
                return res.status(400).json({
                    message: "Payment processing failed",
                    error: error.response.data,
                    status: "PAYMENT_PROCESSING_ERROR"
                });
            }

            next(error);
        }
    }
    async checkAndCancelStalePendingBookings() {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);

            const staleBookings = await Booking.findAll({
                where: {
                    status: "pending",
                    booked_at: { [Op.lt]: fiveMinutesAgo }
                }
            }); // Debugging log



            // Ensure we have an array to iterate over
            const bookingsToProcess = Array.isArray(staleBookings) ? staleBookings : [];

            if (bookingsToProcess.length === 0) {
                console.log('No stale bookings found....');
                return;
            }

            console.log(`Found ${bookingsToProcess.length} stale bookings to process`);

            for (const booking of bookingsToProcess) {
                try {
                    if (!booking || !booking.booking_id) {
                        console.error('Invalid booking object:', booking);
                        continue;
                    }

                    await bookingSvc.updateBooking(booking.booking_id, "cancelled", false);
                    console.log(`Auto-cancelled stale booking ${booking.booking_id}`);

                    // Additional cleanup:
                    // - Release booked slots
                    // - Send notification to user
                    // - Log the cancellation
                } catch (updateError) {
                    console.error(`Failed to cancel stale booking ${booking.booking_id}:`, updateError);
                    next(updateError);
                }
            }
        } catch (error) {
            console.error("Error in checkAndCancelStalePendingBookings:", error);
        }
    }
    //checks for pending bookings and is 5 min older
    setupStaleBookingChecker() {
        // Set up periodic check (runs every 5 minutes)
        setInterval(() => {
            this.checkAndCancelStalePendingBookings();
        }, 5 * 60 * 1000);
    }

    getUserTransactions = async (req, res, next) => {
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

            // First, get the total count of transactions for this user
            const countQuery = `
                SELECT COUNT(t.transaction_id) as total
                FROM "Transactions" t
                JOIN "Bookings" b ON t.booking_id = b.booking_id
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

            // Main query to fetch transactions with related booking and futsal info
            const query = `
               SELECT t.*
                FROM "Transactions" t
                JOIN "Bookings" b ON t.booking_id = b.booking_id
                WHERE b.user_id = :userId
                ORDER BY t.transaction_date DESC
                LIMIT :limit OFFSET :offset;
            `;

            const results = await sequelize.query(query, {
                replacements: { userId, limit, offset },
                type: sequelize.QueryTypes.SELECT,
                raw: true,
                nest: true
            });

            if (!results || results.length === 0) {
                return res.status(404).json({
                    result: [],
                    message: "No transactions found for this user.",
                    status: "NOT_FOUND"
                });
            }

            // Format the results
            const formattedResults = results.map(transaction => ({
                ...transaction,
                slots: transaction.slots || []
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
                message: "User transactions fetched successfully.",
                status: "TRANSACTIONS_FETCHED"
            });

        } catch (exception) {
            console.error("Error fetching user transactions:", exception);
            res.status(500).json({
                result: null,
                message: exception.message || "Failed to fetch user transactions",
                meta: null,
                status: "INTERNAL_SERVER_ERROR"
            });
        }
    };
    getFutsalTransactions = async (req, res, next) => {
        try {
            const futsalId = req.authUser.futsal_id;
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 10; // Default 10 items per page

            if (!futsalId) {
                return res.status(400).json({
                    result: null,
                    message: "Missing required parameter: futsalId.",
                    status: "BAD_REQUEST"
                });
            }

            // First, get the total count of transactions for this futsal
            const countQuery = `
                SELECT COUNT(t.transaction_id) as total
                FROM "Transactions" t
                JOIN "Bookings" b ON t.booking_id = b.booking_id
                JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN "Slots" s ON bs.slot_id = s.slot_id
                JOIN "Courts" c ON s.court_id = c.court_id
                WHERE c.futsal_id = :futsalId
            `;

            const countResult = await sequelize.query(countQuery, {
                replacements: { futsalId },
                type: sequelize.QueryTypes.SELECT,
                raw: true
            });

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;

            // Main query to fetch transactions with related booking and futsal info
            const query = `
                SELECT 
                    t.*,
                    b.user_id,
                    b.booking_date,
                    b.status as booking_status,
                    c.title as court_title,
                    s.title as slot_title,
                    s.start_time,
                    s.end_time,
                    s.price
                FROM "Transactions" t
                JOIN "Bookings" b ON t.booking_id = b.booking_id
                JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN "Slots" s ON bs.slot_id = s.slot_id
                JOIN "Courts" c ON s.court_id = c.court_id
                WHERE c.futsal_id = :futsalId
                ORDER BY t.transaction_date DESC
                LIMIT :limit OFFSET :offset;
            `;

            const results = await sequelize.query(query, {
                replacements: { futsalId, limit, offset },
                type: sequelize.QueryTypes.SELECT,
                raw: true,
                nest: true
            });

            if (!results || results.length === 0) {
                return res.status(404).json({
                    result: [],
                    message: "No transactions found for this futsal.",
                    status: "NOT_FOUND"
                });
            }

            // Format the results
            const formattedResults = results.map(transaction => ({
                transaction_id: transaction.transaction_id,
                transaction_date: transaction.transaction_date,
                total_payment: transaction.total_payment,
                payment_status: transaction.payment_status,
                payment_session_id: transaction.payment_session_id,
                payment_type: transaction.payment_type,
                booking: {
                    user_id: transaction.user_id,
                    booking_date: transaction.booking_date,
                    status: transaction.booking_status
                },
                slot: {
                    court_title: transaction.court_title,
                    slot_title: transaction.slot_title,
                    start_time: transaction.start_time,
                    end_time: transaction.end_time,
                    price: transaction.price
                }
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
                message: "Futsal transactions fetched successfully.",
                status: "TRANSACTIONS_FETCHED"
            });

        } catch (exception) {
            console.error("Error fetching futsal transactions:", exception);
            res.status(500).json({
                result: null,
                message: exception.message || "Failed to fetch futsal transactions",
                meta: null,
                status: "INTERNAL_SERVER_ERROR"
            });
        }
    };
}

const transactionCtrl = new TransactionController();
module.exports = { transactionCtrl };