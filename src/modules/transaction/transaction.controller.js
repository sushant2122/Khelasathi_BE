const axios = require('axios');
const { bookingSvc } = require('../booking/booking.service');
const { transactionSvc } = require('./transaction.service');
const { Op } = require('sequelize'); // Make sure to import Op if using Sequelize
const { Booking } = require('../../config/db.config');

class TransactionController {
    constructor() {
        // Initialize the periodic check when the controller is instantiated
        this.setupStaleBookingChecker();
    }

    async addTransaction(req, res) {
        try {
            const { txnId, pidx, amount, purchase_order_id, transaction_id, message } = req.query;

            // 1. Initial validation
            if (message) {
                return res.status(400).json({
                    result: message,
                    message: "Error processing khalti",
                    status: "KHALTI_BAD_REQUEST"
                });
            }

            if (!purchase_order_id || !pidx) {
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

            let response;
            try {
                response = await axios.post(
                    "https://a.khalti.com/api/v2/epayment/lookup/",
                    { pidx },
                    { headers }
                );
                console.log("Response data from lookup:", response.data);
            } catch (axiosError) {
                console.error("Khalti API Error:", axiosError.response?.data || axiosError.message);

                // Create failed transaction record
                const transactionData = {
                    booking_id: purchase_order_id,
                    total_payment: amount ? amount / 100 : 0,
                    payment_session_id: pidx,
                    payment_type: "E-Wallet",
                    payment_status: "failed",
                    error_details: axiosError.response?.data || { error: axiosError.message }
                };

                await transactionSvc.createTransaction(transactionData);
                await bookingSvc.updateBooking(purchase_order_id, "cancelled", false);

                return res.status(400).json({
                    message: "Payment verification failed",
                    error: axiosError.response?.data || axiosError.message,
                    status: "KHALTI_VERIFICATION_FAILED"
                });
            }

            // 3. Handle payment status
            if (response.data.status !== "Completed") {
                const transactionData = {
                    booking_id: purchase_order_id,
                    total_payment: response.data.total_amount / 100,
                    payment_session_id: pidx,
                    payment_type: "E-Wallet",
                    payment_status: "failed",
                    error_details: response.data
                };

                await transactionSvc.createTransaction(transactionData);
                await bookingSvc.updateBooking(purchase_order_id, "cancelled", false);

                return res.status(400).json({
                    result: response.data,
                    message: "Payment not completed",
                    status: "PAYMENT_NOT_COMPLETED"
                });
            }

            // 4. Get booking details
            const bookingDetails = await bookingSvc.listAllByFilter({ booking_id: purchase_order_id });

            if (!bookingDetails || bookingDetails.length === 0) {
                return res.status(404).json({
                    message: "Booking not found",
                    status: "BOOKING_NOT_FOUND"
                });
            }

            const booking = bookingDetails[0];

            // 5. Process successful payment
            const updatedBooking = await bookingSvc.updateBooking(purchase_order_id, "completed", true);

            const transactionData = {
                booking_id: purchase_order_id,
                total_payment: response.data.total_amount / 100, // Convert to rupees
                payment_session_id: response.data.transaction_id,
                payment_type: "E-Wallet",
                payment_status: "paid",
            };

            const transaction = await transactionSvc.createTransaction(transactionData);

            // 6. Return success response
            return res.status(200).json({
                message: "Payment processed successfully",
                status: "PAYMENT_SUCCESS",
                booking: updatedBooking,
                transaction: transaction
            });

        } catch (error) {
            console.error("Error in addTransaction:", error);

            if (error.response?.data) {
                return res.status(400).json({
                    message: "Payment verification failed",
                    error: error.response.data,
                    status: "KHALTI_VERIFICATION_FAILED"
                });
            }

            return res.status(500).json({
                message: "Internal server error",
                error: error.message,
                status: "INTERNAL_SERVER_ERROR"
            });
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
}

const transactionCtrl = new TransactionController();
module.exports = { transactionCtrl };