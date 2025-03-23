const { Slot_Schedule } = require("../../config/db.config");

class SlotScheduleService {

    createSchedule = async (data) => {
        try {
            const newSchedule = await Slot_Schedule.create(data);
            return newSchedule;
        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async (filter = {}) => {
        try {
            const list = await Slot_Schedule.findAll({ where: filter });
            return { list };
        } catch (exception) {
            throw exception;
        }
    };

    getSingleScheduleData = async (filter) => {
        try {
            const scheduledetail = await Slot_Schedule.findOne({ where: filter });

            if (!scheduledetail) {
                throw ({ code: 404, message: "Schedule does not exists.", status: "SLOT_SCHEDULE_NOT_FOUND" });
            } else {
                return scheduledetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateSchedule = async (Id, data) => {
        try {
            // First, make sure the banner exists
            const schedule = await Slot_Schedule.findOne({ where: { schedule_id: Id } });

            if (!schedule) {
                throw { code: 400, message: "Schedule not found", status: "SLOT_SCHEDULE_NOT_FOUND" };
            }

            // Now update the banner with the new data
            const updatedSchedule = await schedule.update(data);

            return updatedSchedule;

        } catch (exception) {
            throw exception;
        }
    }
    deleteScheduleById = async (id) => {

        try {
            const result = await Slot_Schedule.destroy({
                where: {
                    schedule_id: id // Specify the ID of the banner to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Slot schedule already deleted or does not exists.", status: "SLOT_SCHEDULE_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };

}
const scheduleSvc = new SlotScheduleService();
module.exports = { scheduleSvc };