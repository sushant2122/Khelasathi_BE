const { default: axios } = require("axios");
const { Transaction } = require("../../config/db.config");
class TransactionService {
    //before code
    callKhalti = async (formData) => { // Remove req, res from parameters
        try {
            const headers = {
                Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            };
            const response = await axios.post(
                "https://dev.khalti.com/api/v2/epayment/initiate/",
                formData, {
                headers,
            });
            return {
                message: "khalti success",
                payment_method: "khalti",
                data: response.data
            };
        } catch (exception) {
            throw exception;
        }
    }
    refundKhalti = async (formData, transaction_id) => {
        try {
            const headers = {
                Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            };

            console.log(transaction_id);

            const txn_id = transaction_id;

            // Process refund
            try {
                response = await axios.post(
                    `https://a.khalti.com/api/merchant-transaction/${txn_id}/refund/`,
                    formData,
                    { headers } // Ensure headers are included
                );
            } catch (error) {
                return {
                    message: "Failed to process refund",
                    error: error.response?.data || "Unknown error",
                };
            }

            return {
                message: "Khalti refund success",
                payment_method: "Khalti",
                data: response.data,
            };
        } catch (exception) {
            console.error("Error in refundKhalti:", exception.message);
            return {
                message: "An unexpected error occurred",
                error: exception.message,
            };
        }
    };
    createTransaction = async (data) => {
        try {

            const existingTransaction = await Transaction.findOne({
                where: { payment_session_id: data.payment_session_id }
            });

            if (existingTransaction) {
                throw {
                    code: 400,
                    message: "Transaction with this payment session ID already exists",
                    detail: existingTransaction,
                    status: "DUPLICATE_TRANSACTION"
                };
            }

            // Create the transaction
            const newTransaction = await Transaction.create({
                booking_id: data.booking_id,
                total_payment: data.total_payment,
                payment_session_id: data.payment_session_id,
                payment_type: data.payment_type,
                payment_status: data.payment_status || "pending",
                // transaction_date will be automatically set by defaultValue
            });

            return newTransaction;

        } catch (error) {
            throw {
                code: 400,
                detail: error,
                status: "TRANSACTION_CREATION_ERROR"
            };
        }

    }
    getSingleData = async (filter) => {
        try {
            const transaction = await Transaction.findOne({ where: filter });

            if (!transaction) {
                throw ({ code: 404, message: "Transaction does not exists.", status: "TRANSACTION_NOT_FOUND" });
            } else {
                return transaction;
            }

        } catch (exception) {
            throw exception;
        }
    }
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Transaction.count({
                where: filter
            });

            const list = await Transaction.findAll({
                where: filter,

                order: [['transaction_date', 'DESC']], // Sorting by createdAt descending
                limit: limit,
                offset: offset
            });

            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };
}
const transactionSvc = new TransactionService();
module.exports = { transactionSvc }