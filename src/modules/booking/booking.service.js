// booking.service.js
const { Booking, Booked_slot, } = require("../../config/db.config");
const { creditSvc } = require("../credit_point/credit_point.service");
const { transactionSvc } = require("../transaction/transaction.service");

class BookingService {

    // booking.service.js
    transformBookingData = (req) => {
        const data = req.body;
        data.user_id = req.authUser.user_id;
        data.booked_at = new Date(Date.now());

        // Calculate total amount and points from slots
        if (data.slots && data.slots.length > 0) {
            data.total_amount = data.slots.reduce((sum, slot) => sum + slot.price, 0);
            data.total_points_collected = data.slots.length * 10; // 10 points per slot
        } else {
            data.total_amount = 0;
            data.total_points_collected = 0;
        }

        return data;
    }
    // for redeeming point 
    createBookingthroughPoint = async (data) => {
        const t = await Booking.sequelize.transaction();

        try {
            // Validate slots
            if (!data.slots || data.slots.length === 0) {
                throw {
                    code: 400,
                    message: "At least one slot is required",
                    status: "NO_SLOTS_PROVIDED"
                };
            }

            // Calculate totals
            const total_amount = data.slots.reduce((sum, slot) => {
                if (!slot.price || isNaN(slot.price)) {
                    throw {
                        code: 400,
                        message: "Invalid price for one or more slots",
                        status: "INVALID_SLOT_PRICE"
                    };
                }
                return sum + parseFloat(slot.price);
            }, 0);


            // const total_required_points = 40;
            const total_required_points = data.slots.reduce((sum, slot) => {
                if (!slot.credit_point || isNaN(slot.credit_point)) {
                    throw {
                        code: 400,
                        message: "Invalid credit points for one or more slots",
                        status: "INVALID_SLOT_CREDIT_POINTS"
                    };
                }
                return sum + parseInt(slot.credit_point, 10);
            }, 0);


            // Fetch user's available credit points
            const userAvailablePoints = await creditSvc.calculateUserCreditPoints(data.user_id);


            // Check if user has enough points
            if (userAvailablePoints < total_required_points) {
                throw {
                    code: 400,
                    message: `Insufficient credit points. Required: ${total_required_points}, Available: ${userAvailablePoints}`,
                    status: "INSUFFICIENT_CREDIT_POINTS"
                };
            }



            // Create the booking
            const newBooking = await Booking.create({
                user_id: data.user_id,
                booking_date: data.booking_date,
                booked_at: new Date(),
                remarks: data.remarks || null,
                is_paid: true, // Assuming points booking is automatically paid
                total_amount,
                total_points_collected: 0,
                status: 'confirmed' // Points booking might auto-confirm
            }, { transaction: t });



            // Create booked slots
            const bookedSlots = data.slots.map(slot => ({
                booking_id: newBooking.booking_id,
                slot_id: slot.slot_id,
                sub_total: slot.price,
                point_collected: 0
            }));

            await Booked_slot.bulkCreate(bookedSlots, { transaction: t });


            // Deduct credit points
            await creditSvc.redeemPoint(data.user_id, newBooking.booking_id, total_required_points, { transaction: t });
            // Get complete booking details

            // 
            const completeBooking = await Booking.findByPk(newBooking.booking_id, {
                include: [{
                    model: Booked_slot,
                    as: 'booked_slots',
                    attributes: ['booked_slot_id', 'slot_id', 'sub_total']
                }],
                transaction: t
            });



            await t.commit();

            return {
                ...completeBooking.toJSON(),
                points_used: total_required_points,
                remaining_credit: userAvailablePoints - total_required_points,
                message: "Booking created successfully using credit points"
            };
        } catch (exception) {
            if (!t.finished) {
                await t.rollback();
            }
            throw {
                ...exception,
                timestamp: new Date(),
                action: "points_booking_creation"
            };
        }
    };
    //for cash payment 
    createBooking = async (data, req, res) => {
        const t = await Booking.sequelize.transaction();
        try {
            // Validate slots
            if (!data.slots || data.slots.length === 0) {
                throw {
                    code: 400,
                    message: "At least one slot is required",
                    status: "NO_SLOTS_PROVIDED"
                };
            }

            // Calculate totals
            const total_amount = data.slots.reduce((sum, slot) => {
                if (!slot.price || isNaN(slot.price)) {
                    throw {
                        code: 400,
                        message: "Invalid price for one or more slots",
                        status: "INVALID_SLOT_PRICE"
                    };
                }
                return sum + parseFloat(slot.price);
            }, 0);

            const total_points = data.slots.length * 10; // 10 points per slot

            // Create the booking
            const newBooking = await Booking.create({
                user_id: data.user_id,
                booking_date: data.booking_date,
                booked_at: new Date(),
                remarks: data.remarks || null,
                is_paid: data.is_paid || false,
                total_amount,
                total_points_collected: total_points,
                status: 'pending'
            }, { transaction: t });

            // Create booked slots
            const bookedSlots = data.slots.map(slot => ({
                booking_id: newBooking.booking_id,
                slot_id: slot.slot_id,
                sub_total: slot.price,
                point_collected: 10
            }));

            await Booked_slot.bulkCreate(bookedSlots, { transaction: t });


            //for payment integration 
            const formdata = {

                "return_url": "http://localhost:5173/transaction-process",
                "website_url": "http://localhost:5173/",
                "amount": total_amount * 100,
                "purchase_order_id": newBooking.booking_id,
                "purchase_order_name": `Booking-${newBooking.booking_id}`,
            }

            const transactiondetails = await transactionSvc.callKhalti(formdata);

            // Get complete booking details
            const completeBooking = await Booking.findByPk(newBooking.booking_id, {
                include: [{
                    model: Booked_slot,
                    as: 'booked_slots',
                    attributes: ['booked_slot_id', 'slot_id', 'sub_total']
                }],
                transaction: t
            });

            await t.commit();

            return {
                ...completeBooking.toJSON(),
                points_earned: total_points,
                payment_link: transactiondetails,
                message: "Booking created successfully"
            };
        } catch (exception) {
            if (!t.finished) {
                await t.rollback();
            }
            throw {
                ...exception,
                timestamp: new Date(),
                action: "booking_creation"
            };
        }
    };

    updateBooking = async (bookingId, status, paidstatus) => {
        try {
            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                throw {
                    code: 404,  // Changed from 400 to 404 for "Not Found"
                    message: "Booking not found",
                    status: "BOOKING_NOT_FOUND"
                };
            }

            const updatedBooking = await booking.update({
                status: status,
                is_paid: paidstatus,

            });

            return updatedBooking;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw {
                code: 500,
                message: "Failed to update booking",
                status: "UPDATE_FAILED",
                error: error.message
            };
        }
    }
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Booking.count({
                where: filter
            });

            const list = await Booking.findAll({
                where: filter,
                order: [['booked_at', 'DESC']], // Sorting by createdAt descending
                limit: limit,
                offset: offset
            });

            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };

}
const bookingSvc = new BookingService();
module.exports = { bookingSvc };