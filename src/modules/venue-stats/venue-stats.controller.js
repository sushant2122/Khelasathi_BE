const { Booking, Transaction, Futsal, sequelize, Court, Booked_slot, Slot } = require("../../config/db.config");

class VenueStatsController {
    getVenueStats = async (req, res, next) => {
        try {
            const futsalId = req.authUser.futsal_id;

            if (!futsalId) {
                return res.status(400).json({
                    message: 'Venue ID is required'
                });
            }

            // Execute all queries in parallel
            const [totalBookings, totalRevenue, totalCourts, closingdays] = await Promise.all([
                // 1. Total Bookings
                sequelize.query(
                    `SELECT COUNT(DISTINCT b.booking_id) AS total_bookings
                    FROM "Bookings" b
                    JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                    JOIN "Slots" s ON bs.slot_id = s.slot_id
                    JOIN "Courts" c ON s.court_id = c.court_id
                    WHERE c.futsal_id = :futsalId;`,
                    {
                        replacements: { futsalId },
                        type: sequelize.QueryTypes.SELECT,
                        plain: true
                    }
                ),

                // 2. Total Revenue
                sequelize.query(
                    `SELECT COALESCE(SUM(t.total_payment), 0) AS total_revenue
                    FROM "Transactions" t
                    JOIN "Bookings" b ON t.booking_id = b.booking_id
                    JOIN "Booked_slots" bs ON b.booking_id = bs.booking_id
                    JOIN "Slots" s ON bs.slot_id = s.slot_id
                    JOIN "Courts" c ON s.court_id = c.court_id
                    WHERE c.futsal_id = :futsalId
                    AND t.payment_status = 'paid';`,
                    {
                        replacements: { futsalId },
                        type: sequelize.QueryTypes.SELECT,
                        plain: true
                    }
                ),

                // 3. Total Courts
                sequelize.query(
                    `SELECT COUNT(*) AS total_courts
                    FROM "Courts"
                    WHERE futsal_id = :futsalId;`,
                    {
                        replacements: { futsalId },
                        type: sequelize.QueryTypes.SELECT,
                        plain: true
                    }
                ),

                // 4. Pending Bookings
                sequelize.query(
                    `
            SELECT 
                COUNT(*) AS total_closing
            FROM 
                "Closing_days" cd
            JOIN 
                "Courts" c ON cd.court_id = c.court_id
            WHERE 
                c.futsal_id = :futsalId
                AND cd.date >= CURRENT_DATE
        ;`,
                    {
                        replacements: { futsalId },
                        type: sequelize.QueryTypes.SELECT,
                        plain: true
                    }
                )
            ]);

            // Format the revenue as currency
            const formattedRevenue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(totalRevenue.total_revenue || 0);

            const stats = [
                { name: 'Total Bookings', value: (totalBookings.total_bookings || 0).toString(), icon: 'Calendar' },
                { name: 'Total Revenue', value: formattedRevenue, icon: 'TrendingUp' },
                { name: 'Total Courts', value: (totalCourts.total_courts || 0).toString(), icon: 'MapPinned' },
                { name: 'Total Closing Days', value: (closingdays.total_closing || 0).toString(), icon: 'CalendarX' },
            ];

            res.json({
                result: stats,
                message: 'Venue statistics retrieved successfully'
            });

        } catch (error) {
            next(error);
        }
    }
    getLatestBookingsByVenue = async (req, res, next) => {
        try {
            const futsalId = req.authUser.futsal_id;
            const limit = req.query.limit || 5;

            if (!futsalId) {
                return res.status(400).json({
                    message: 'Venue ID is required'
                });
            }

            const query = `
                SELECT 
                    b.booking_id,
                    b.booking_date,
                    b.status,
                    b.total_amount,
                    u.full_name AS customer_name,
                    c.title AS court_title,
                    TO_CHAR(b.booked_at, 'YYYY-MM-DD HH24:MI:SS') AS booked_at
                FROM 
                    "Bookings" b
                JOIN 
                    "Users" u ON b.user_id = u.user_id
                JOIN 
                    "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN 
                    "Slots" s ON bs.slot_id = s.slot_id
                JOIN 
                    "Courts" c ON s.court_id = c.court_id
                WHERE 
                    c.futsal_id = :futsalId
                ORDER BY 
                    b.booked_at DESC
                LIMIT 5
            `;

            const results = await sequelize.query(query, {
                replacements: { futsalId },
                type: sequelize.QueryTypes.SELECT
            });

            res.json({
                result: results,
                message: 'Latest bookings retrieved successfully'
            });

        } catch (error) {
            console.error('Error in getLatestBookingsByVenue:', error);
            next(error);
        }
    }

    getMonthlyRevenue = async (req, res, next) => {
        try {
            const futsalId = req.authUser.futsal_id;

            if (!futsalId) {
                return res.status(400).json({
                    message: 'Venue ID is required'
                });
            }

            const query = `
                SELECT 
                    TO_CHAR(t.transaction_date, 'Mon') AS month,
                    EXTRACT(MONTH FROM t.transaction_date) AS month_num,
                    SUM(t.total_payment)::numeric AS revenue
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
                WHERE 
                    t.payment_status = 'paid'
                    AND t.transaction_date >= DATE_TRUNC('year', CURRENT_DATE)
                    AND c.futsal_id = :futsalId
                GROUP BY 
                    month, month_num
                ORDER BY 
                    month_num ASC
            `;

            const results = await sequelize.query(query, {
                replacements: { futsalId },
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
            const futsalId = req.authUser.futsal_id;

            if (!futsalId) {
                return res.status(400).json({
                    message: 'Venue ID is required'
                });
            }

            const query = `
                SELECT 
                    b.status,
                    COUNT(*)::integer AS count
                FROM 
                    "Bookings" b
                JOIN 
                    "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN 
                    "Slots" s ON bs.slot_id = s.slot_id
                JOIN 
                    "Courts" c ON s.court_id = c.court_id
                WHERE 
                    c.futsal_id = :futsalId
                GROUP BY 
                    b.status
            `;

            const results = await sequelize.query(query, {
                replacements: { futsalId },
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
            const futsalId = req.authUser.futsal_id;

            if (!futsalId) {
                return res.status(400).json({
                    message: 'Venue ID is required'
                });
            }

            const query = `
                SELECT 
                    t.transaction_id,
                    t.transaction_date,
                    t.total_payment AS amount,
                    t.payment_status,
                    c.title AS court_name,
                    TO_CHAR(t.transaction_date, 'YYYY-MM-DD HH24:MI:SS') AS formatted_date,
                    u.full_name AS customer_name
                FROM 
                    "Transactions" t
                JOIN 
                    "Bookings" b ON t.booking_id = b.booking_id
                JOIN 
                    "Users" u ON b.user_id = u.user_id
                JOIN 
                    "Booked_slots" bs ON b.booking_id = bs.booking_id
                JOIN 
                    "Slots" s ON bs.slot_id = s.slot_id
                JOIN 
                    "Courts" c ON s.court_id = c.court_id
                WHERE 
                    c.futsal_id = :futsalId
                ORDER BY 
                    t.transaction_date DESC
                LIMIT 5
            `;

            const results = await sequelize.query(query, {
                replacements: { futsalId },
                type: sequelize.QueryTypes.SELECT
            });

            // Format the response
            const formattedResults = results.map(transaction => ({
                id: transaction.transaction_id,
                date: transaction.formatted_date,
                amount: transaction.amount,
                status: transaction.payment_status,
                court: transaction.court_name,
                customer: transaction.customer_name
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
}

const venueStatsCtrl = new VenueStatsController();
module.exports = venueStatsCtrl;