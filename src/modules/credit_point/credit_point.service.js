const { Credit_point } = require("../../config/db.config");

class CreditPointService {
    calculateUserCreditPoints = async (userId) => {
        try {

            const creditRecords = await Credit_point.findAll({
                where: {
                    user_id: userId
                }
            });

            // Calculate the total credit points
            let totalCreditPoints = 0;

            creditRecords.forEach(record => {
                if (record.transaction_type === 'earned') {
                    totalCreditPoints += record.credit_amount;
                } else if (record.transaction_type === 'redeemed') {
                    totalCreditPoints -= record.credit_amount;
                }
            });

            return totalCreditPoints;
        } catch (error) {
            console.error('Error calculating credit points:', error);
            throw error; // Re-throw the error for the caller to handle
        }
    }

    earnPoint = async (userid, bookingid, total_points, { transaction: t }) => {
        await Credit_point.create({
            user_id: userid,
            credit_session_id: `booking-${bookingid}`,
            transaction_type: "earned",
            credit_amount: total_points,
            transaction_date: new Date(),
            remarks: `Points from booking ${bookingid}`
        }, { transaction: t });


    }

    redeemPoint = async (userid, bookingid, total_points, { transaction: t }) => {
        await Credit_point.create({
            user_id: userid,
            credit_session_id: `booking-${bookingid}`,
            transaction_type: "redeemed",
            credit_amount: total_points,
            transaction_date: new Date(),
            remarks: `Points redeemed for booking ${bookingid}`
        }, { transaction: t });

    }
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Credit_point.count({
                where: filter
            });
            const list = await Credit_point.findAll({
                where: filter,
                limit: limit,
                offset: offset
            });
            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };
}
const creditSvc = new CreditPointService();

module.exports = { creditSvc }