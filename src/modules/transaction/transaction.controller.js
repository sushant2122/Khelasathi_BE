const axios = require('axios');
class TransactionController {

    addTransaction = async (req, res, next) => {
        try {
            const { txnId, pidx, amount, purchase_order_id, transaction_id, message } = req.query;
            if (message) {
                return res.status(400).json({
                    result: message,
                    message: "Error processing khalti",
                    status: "KHALTI_BAD_REQUEST"
                });
            }
            const headers = {
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            };
            const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/", { pidx }, { headers })

            console.log("response data too lookup", response.data);
            if (response.data.status != "Completed") {
                return false;
                return res.status(400).json({
                    result: message,
                    message: "Payment not completed.",
                    status: "PAYMENT_NOT_COMPLETED"

                });
            }
            return true;


        }
        catch (exception) {
            throw exception;
        }

    }

}
const transactionCtrl = new TransactionController();
module.exports = { transactionCtrl }