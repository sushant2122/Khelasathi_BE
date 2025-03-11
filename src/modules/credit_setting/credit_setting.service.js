
const { Credit_setting } = require("../../config/db.config");


class CreditSettingService {


    transformCreditSettingData = async (req) => {
        const data = req.body;
        if (req.authUser.futsal_id) {
            data.futsal_id = req.authUser.futsal_id; // Attach futsal_id
            return data;
        } else {
            throw { code: 400, message: "Futsal  not registered by the user", status: "FUTSAL_NOT_REGISTERED" };
        }
    };

    addCreditSetting = async (data, req) => {
        try {


            // Check if the user already has a registered futsal (only for users with role 'Venue')
            const creditSettingRegistered = await Credit_setting.findOne({
                where: { futsal_id: req.authUser.futsal_id }
            });

            // If credit setting is already added, throw an error
            if (creditSettingRegistered) {
                throw {
                    code: 400,
                    detail: "Credit already set for this account.",
                    status: "CREDIT_SETTING_ALREADY_SET"
                };
            }

            const newCredit = await Credit_setting.create(data);
            return newCredit;

        } catch (exception) {
            throw exception;
        }
    };



    getCreditSettingData = async (filter, req) => {
        try {
            const creditSettingDetail = await Credit_setting.findOne({
                where: filter
            });

            if (!creditSettingDetail && req.authUser.role_title == "Venue") {
                throw ({ code: 404, message: "Set Credit for your futsal.", status: "FUTSAL_CREDIT_NOT_SET" });
            }
            else if (!creditSettingDetail) {
                throw ({ code: 404, message: "Credit  details not found.", status: "FUTSAL_CREDIT_NOT_FOUND" });
            } else {
                return creditSettingDetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateCreditSetting = async (filter, data) => {
        try {
            const setting = await Credit_setting.findOne({ where: filter });
            if (!setting) throw { code: 400, message: "Futsal Credit setting not found", status: "FUTSAL_CREDIT_NOT_SET" };

            await setting.update(data);
            return setting;
        } catch (error) {
            throw error;
        }
    }


}
const creditSettingSvc = new CreditSettingService();
module.exports = { creditSettingSvc };