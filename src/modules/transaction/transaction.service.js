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
}
const transactionSvc = new TransactionService();
module.exports = { transactionSvc }