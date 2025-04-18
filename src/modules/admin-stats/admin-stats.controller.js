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

            // Format the revenue as currency
            const formattedRevenue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(totalRevenue || 0);

            const stats = [
                { name: 'Total Bookings', value: (totalBookings || 0).toString(), icon: 'Calendar' },
                { name: 'Total Revenue', value: formattedRevenue, icon: 'TrendingUp' },
                { name: 'Active Venues', value: (totalActiveVenues || 0).toString(), icon: 'Users' },
                { name: 'Pending Bookings', value: (pendingBookings || 0).toString(), icon: 'CreditCard' },
            ];

            res.json({
                result: stats,
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



}

const adminStatsCtrl = new AdminStatsController();
module.exports = adminStatsCtrl;