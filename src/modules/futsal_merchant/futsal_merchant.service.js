const { Status } = require("../../config/constants.config");
const { FutsalMerchant } = require("../../config/db.config");
const bcrypt = require("bcryptjs");
class FutsalMerchantService {

    transformFutsalMerchantDetails = async (req) => {

        const data = req.body

        const futsal_id = 1;

        return data;
    }

    createFutsalMerchant = async (futsalMerchantData) => {
        try {


            const newFutsalMerchant = await FutsalMerchant.create(futsalMerchantData);

            return newUser;

        } catch (error) {
            console.error('❌ Error adding futsal merchant details.:', error);
            throw error; // Let the controller handle unexpected errors
        }
    };

    getSingleMerchantByFilter = async (filter) => {
        try {
            const futsalmerchant = await FutsalMerchant.findOne({
                where: filter
            });

            if (!futsalmerchant) {
                throw ({ code: 400, message: "futsal merchant not found", status: "FUTSALMERCHANT_NOT_FOUND" })
            } else {
                return futsalmerchant;
            }

        } catch (exception) {
            throw exception;

        }
    }

    updateFutsalMerchantById = async (filter, data) => {
        try {

            const futsalmerchant = await FutsalMerchant.findOne({
                where: filter
            });

            if (!futsalmerchant) {
                throw ({ code: 400, message: "futsal merchant not found", status: "FUTSALMERCHANT_NOT_FOUND" })
            }


            const updatedFutsalMerchant = await FutsalMerchant.update(data);

            return updatedFutsalMerchant;

        } catch (exception) {
            throw exception;
        }
    }


}
const merchantSvc = new FutsalMerchantService();
module.exports = {
    merchantSvc
}