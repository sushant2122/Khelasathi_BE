const { FutsalMerchant, Futsal } = require("../../config/db.config");
const { ValidationError } = require('sequelize'); // Sequelize validation error class

class FutsalMerchantService {
    transformFutsalMerchantDetails = async (req) => {
        const data = req.body;
        if (req.authUser.futsal_id) {
            data.futsal_id = req.authUser.futsal_id; // Attach futsal_id
            return data;
        } else {
            throw { code: 400, message: "Futsal  not registered by the user", status: "FUTSAL_NOT_REGISTERED" };
        }


    }

    async createFutsalMerchant(futsalMerchantData) {
        try {
            return await FutsalMerchant.create(futsalMerchantData);
        } catch (error) {
            if (error instanceof ValidationError && error.errors[0].type === 'unique violation') {
                // Custom error message for duplicate futsal_id and service_id
                throw { code: 409, result: error, message: "Futsal  and Service ID is already registered.", status: "FUTSAL_SERVICE_ALREADY_REGISTERED" };

            }

            throw error;
        }
    }

    listAllByFilter = async (filter = {}) => {
        try {
            const list = await FutsalMerchant.findAll({
                where: filter,
                include: [
                    {
                        model: Futsal,
                        attributes: ['futsal_id', 'name']
                    }
                ],
                order: [['createdAt', 'DESC']] // Sorting by createdAt descending
            });

            return list;
        } catch (exception) {
            throw exception;
        }
    };
    async getSingleMerchantByFilter(filter) {
        try {
            const merchant = await FutsalMerchant.findOne({ where: filter });
            if (!merchant) throw { code: 400, message: "Futsal merchant not found", status: "FUTSALMERCHANT_NOT_FOUND" };
            return merchant;
        } catch (error) {
            throw error;
        }
    }

    async updateFutsalMerchantById(filter, data) {
        try {
            const merchant = await FutsalMerchant.findOne({ where: filter });
            if (!merchant) throw { code: 400, message: "Futsal merchant not found", status: "FUTSALMERCHANT_NOT_FOUND" };

            await merchant.update(data);
            return merchant;
        } catch (error) {
            throw error;
        }
    }
    deleteFutsalById = async (id) => {
        try {
            const futsalMerchant = await FutsalMerchant.findOne({ where: { payment_id: id } });

            if (!futsalMerchant) {
                throw { code: 400, message: "Futsal merchant not found", status: "FUTSAL_MERCHANT_NOT_FOUND" };
            }

            await futsalMerchant.destroy(); // Delete the record

            return { message: "Futsal merchant deleted successfully." };
        } catch (exception) {
            throw exception;
        }
    };
};

const merchantSvc = new FutsalMerchantService();
module.exports = {
    merchantSvc
};