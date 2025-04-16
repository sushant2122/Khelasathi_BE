// booking.controller.js
const { Booking, Transaction, Futsal, sequelize, Court, Booked_slot, Slot } = require("../../config/db.config");

class AdminStatsController {
    getAdminStats = async (req, res, next) => {
        try {
            // 1. Get total bookings count
            const totalBookings = await Booking.count();

            // 2. Get total revenue (sum of all successful transactions)
            const totalRevenue = await Transaction.sum('total_payment', {
                where: {
                    payment_status: 'paid'
                }
            });

            // 3. Get total active venues (futsals that are active and verified)
            const totalActiveVenues = await Futsal.count({
                where: {
                    is_active: true,
                    verification_status: 'approved'
                }
            });

            // 4. Get pending bookings count
            const pendingBookings = await Booking.count({
                where: {
                    status: 'pending'
                }
            });

            res.json({
                result: {
                    totalBookings,
                    totalRevenue: totalRevenue || 0, // In case there are no transactions
                    totalActiveVenues,
                    pendingBookings
                },
                message: 'Admin statistics retrieved successfully'
            });

        } catch (error) {
            next(error);
        }
    }
    getTopBookingsByVenue = async (req, res, next) => {
        try {
            const limit = req.query.limit || 5; // Default to top 5 venues

            const query = `
                SELECT 
                    f.name,
                    COUNT(b.booking_id)::integer AS bookings
                FROM 
                    "Futsals" f
                INNER JOIN 
                    "Courts" c ON f.futsal_id = c.futsal_id
                INNER JOIN 
                    "Slots" s ON c.court_id = s.court_id
                INNER JOIN 
                    "Booked_slots" bs ON s.slot_id = bs.slot_id
                INNER JOIN 
                    "Bookings" b ON bs.booking_id = b.booking_id
                WHERE 
                    b.status = 'completed'
                GROUP BY 
                    f.futsal_id, f.name
                ORDER BY 
                    bookings DESC
                LIMIT $1
            `;

            const results = await sequelize.query(query, {
                bind: [limit],
                type: sequelize.QueryTypes.SELECT
            });

            res.json({
                result: results,
                message: 'Top venues by bookings retrieved successfully'
            });

        } catch (error) {
            console.error('Error in getTopBookingsByVenue:', error);
            next(error);
        }
    }
    getMonthlyRevenue = async (req, res, next) => {
        try {
            const query = `
                SELECT 
                    TO_CHAR(t.transaction_date, 'Mon') AS month,
                    EXTRACT(MONTH FROM t.transaction_date) AS month_num,
                    SUM(t.total_payment)::numeric AS revenue
                FROM 
                    "Transactions" t
                WHERE 
                    t.payment_status = 'paid'
                    AND t.transaction_date >= DATE_TRUNC('year', CURRENT_DATE)
                GROUP BY 
                    month, month_num
                ORDER BY 
                    month_num ASC
            `;

            const results = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            });

            // Format the results to match your desired structure
            const revenueData = results.map(row => ({
                name: row.month,
                revenue: parseFloat(row.revenue) || 0
            }));

            // Complete months data (fill in missing months with 0)
            const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const completeRevenueData = allMonths.map(month => {
                const found = revenueData.find(item => item.name === month);
                return found || { name: month, revenue: 0 };
            });

            res.json({
                result: completeRevenueData,
                message: 'Monthly revenue data retrieved successfully'
            });

        } catch (error) {
            console.error('Error in getMonthlyRevenue:', error);
            next(error);
        }
    }

    getBookingStatusStats = async (req, res, next) => {
        try {
            const query = `
                SELECT 
                    status,
                    COUNT(*)::integer AS count
                FROM 
                    "Bookings"
                GROUP BY 
                    status
            `;

            const results = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            });

            // Map status to display names and format the response
            const statusDisplayMap = {
                'confirmed': 'Confirmed',
                'pending': 'Pending',
                'cancelled': 'Cancelled',
                'completed': 'Completed',
                'no-show': 'No Show'
            };

            const bookingStatusData = results.map(row => ({
                name: statusDisplayMap[row.status] || row.status,
                value: row.count
            }));

            // If you want to include all possible statuses even with 0 count
            const completeStatusData = Object.entries(statusDisplayMap).map(([key, name]) => {
                const found = bookingStatusData.find(item => item.name === name);
                return found || { name, value: 0 };
            });

            res.json({
                result: completeStatusData,
                message: 'Booking status statistics retrieved successfully'
            });

        } catch (error) {
            console.error('Error in getBookingStatusStats:', error);
            next(error);
        }
    }

    getLatestTransactions = async (req, res, next) => {
        try {
            const query = `
                SELECT 
                    t.transaction_id,
                    t.transaction_date,
                    t.total_payment AS amount,
                    t.payment_status,
                    f.name AS futsal_name,
                    c.title AS court_name,
                    TO_CHAR(t.transaction_date, 'YYYY-MM-DD HH24:MI:SS') AS formatted_date
                FROM 
                    "Transactions" t
                JOIN 
                    "Bookings" b ON t.booking_id = b.booking_id
                JOIN 
                    "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN 
                    "Slots" s ON bs.slot_id = s.slot_id
                JOIN 
                    "Courts" c ON s.court_id = c.court_id
                JOIN 
                    "Futsals" f ON c.futsal_id = f.futsal_id
                ORDER BY 
                    t.transaction_date DESC
                LIMIT 5
            `;

            const results = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            });

            // Format the response
            const formattedResults = results.map(transaction => ({
                id: transaction.transaction_id,
                date: transaction.formatted_date,
                amount: transaction.amount,
                status: transaction.payment_status,
                venue: transaction.futsal_name,
                court: transaction.court_name
            }));

            res.json({
                result: formattedResults,
                message: 'Latest transactions retrieved successfully'
            });

        } catch (error) {
            console.error('Error in getLatestTransactions:', error);
            next(error);
        }
    }

    getBookingsByFutsal = async (req, res, next) => {
        try {
            // 1. Validate and parse parameters
            const { futsal_id } = req.params;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const offset = (page - 1) * limit;

            // 2. Strict validation for futsal_id
            if (!/^\d+$/.test(futsal_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Futsal ID. Must be a numeric value',
                    received: futsal_id
                });
            }
            const futsalId = parseInt(futsal_id, 10);

            // 3. Debug logging (remove in production)
            console.log(`Fetching bookings for futsal ID: ${futsalId}`);

            // 4. Main query using parameterized queries
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

            // 5. Format response
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
            console.error('Error in getBookingsByFutsal:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while fetching bookings',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
    getAllFutsalsWithDetails = async (req, res, next) => {
        try {
            // Ensure page and limit are valid numbers
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const offset = (page - 1) * limit;

            const query = `
                WITH futsal_data AS (
                    SELECT 
                        f.*,
                        (
                            SELECT json_agg(json_build_object(
                                'court_id', c.court_id,
                                'title', c.title,
                                'type', c.type,
                                'slots', (
                                    SELECT json_agg(json_build_object(
                                        'slot_id', s.slot_id,
                                        'title', s.title,
                                        'start_time', s.start_time,
                                        'end_time', s.end_time,
                                        'price', s.price,
                                        'is_active', s.is_active
                                    ))
                                    FROM "Slots" s
                                    WHERE s.court_id = c.court_id
                                    AND s.is_active = true
                                )
                            ))
                            FROM "Courts" c
                            WHERE c.futsal_id = f.futsal_id
                        ) AS courts,
                        (
                            SELECT json_agg(json_build_object(
                                'image_id', fi.image_id,
                                'image_url', fi.image,
                                'caption', fi.caption,
                                'is_active', fi.is_active
                            ))
                            FROM "Futsal_images" fi
                            WHERE fi.futsal_id = f.futsal_id
                            AND fi.is_active = true
                        ) AS images,
                        (
                            SELECT json_agg(json_build_object(
                                'tag_id', t.tag_id,
                                'tagname', t.tagname,
                                'is_available', t.is_available
                            ))
                            FROM "Tags" t
                            WHERE t.futsal_id = f.futsal_id
                            AND t.is_available = true
                        ) AS tags,
                        COUNT(*) OVER() AS total_count
                    FROM 
                        "Futsals" f
                    WHERE
                        f.is_active = true
                        AND f.verification_status = 'approved'
                    ORDER BY
                        f.futsal_id ASC
                    LIMIT $1 OFFSET $2
                )
                SELECT * FROM futsal_data;
            `;

            const results = await sequelize.query(query, {
                bind: [limit, offset], // Use bind instead of replacements
                type: sequelize.QueryTypes.SELECT
            });

            // Format the response
            const formattedResults = results.map(futsal => ({
                futsal_id: futsal.futsal_id,
                name: futsal.name,
                description: futsal.description,
                slug: futsal.slug,
                location: futsal.location,
                maplink: futsal.maplink,
                contact_number: futsal.contact_number,
                verification_status: futsal.verification_status,
                courts: futsal.courts || [],
                images: futsal.images || [],
                tags: futsal.tags || []
            }));

            // Pagination info
            const totalCount = results.length > 0 ? results[0].total_count : 0;
            const totalPages = Math.ceil(totalCount / limit);

            res.json({
                success: true,
                data: formattedResults,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_items: totalCount,
                    total_pages: totalPages,
                    has_next_page: page < totalPages,
                    has_prev_page: page > 1
                }
            });

        } catch (error) {
            console.error('Error in getAllFutsalsWithDetails:', {
                message: error.message,
                stack: error.stack,
                original: error.original
            });
            next(error);
        }
    };

}

const adminStatsCtrl = new AdminStatsController();
module.exports = adminStatsCtrl;