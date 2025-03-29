const { default: axios } = require("axios");

class Transaction {
    callKhalti = async (formData, req, res) => {
        try {
            const headers = {
                Authorization: ` key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            };
            const response = await axios.post(
                "https://dev.khalti.com/api/v2/epayment/initiate/",
                formData, {
                headers,
            }
            );
            console.log(response.data);
            console.log(response.data.payment_url);
            res.json({
                message: "khalti sucess",
                payment_method: "khalti",
                data: response.data
            });
        } catch (exception) {
            throw exception;
        }

    }

}
const transactionSvc = new Transaction();
module.exports = { transactionSvc }