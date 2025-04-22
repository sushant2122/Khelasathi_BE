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