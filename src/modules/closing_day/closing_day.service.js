const { Slot_Schedule, Closing_day } = require("../../config/db.config");

class CLosingDayService {

    createClosingDay = async (data) => {
        try {
            const newClosing = await Closing_day.create(data);
            return newClosing;
        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async (filter = {}) => {
        try {
            const list = await Closing_day.findAll({ where: filter });
            return { list };
        } catch (exception) {
            throw exception;
        }
    };

    getSingleClosingData = async (filter) => {
        try {
            const closingdetail = await Closing_day.findOne({ where: filter });

            if (!closingdetail) {
                throw ({ code: 404, message: "Closing day does not exists.", status: "CLOSING_DAY_NOT_FOUND" });
            } else {
                return closingdetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateClosing = async (Id, data) => {
        try {
            // First, make sure the banner exists
            const closing = await Closing_day.findOne({ where: { closing_day_id: Id } });

            if (!closing) {
                throw { code: 400, message: "Closing day not found", status: "CLOSING_DAY_NOT_FOUND" };
            }

            // Now update the banner with the new data
            const updatedClosing = await closing.update(data);

            return updatedClosing;

        } catch (exception) {
            throw exception;
        }
    }
    deleteClosingById = async (id) => {

        try {
            const result = await Closing_day.destroy({
                where: {
                    closing_day_id: id // Specify the ID of the banner to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Closing day already deleted or does not exists.", status: "CLOSING_DAY_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };

}
const closingSvc = new CLosingDayService();
module.exports = { closingSvc };