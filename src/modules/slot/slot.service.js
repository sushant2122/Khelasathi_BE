const { Slot } = require("../../config/db.config");

class SlotService {

    createSlot = async (data) => {
        try {
            const newSlot = await Slot.create(data);
            return newSlot;
        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async (filter = {}) => {
        try {
            const list = await Slot.findAll({ where: filter });
            return { list };
        } catch (exception) {
            throw exception;
        }
    };

    getSingleSlotData = async (filter) => {
        try {
            const slotDetail = await Slot.findOne({ where: filter });

            if (!slotDetail) {
                throw ({ code: 404, message: "Slot does not exists.", status: "SLOT_NOT_FOUND" });
            } else {
                return slotDetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateSlot = async (Id, data) => {
        try {
            // First, make sure the banner exists
            const slot = await Slot.findOne({ where: { slot_id: Id } });

            if (!slot) {
                throw { code: 400, message: "Slot not found", status: "SLOT_NOT_FOUND" };
            }

            // Now update the banner with the new data
            const updatedSlot = await slot.update(data);

            return updatedSlot;

        } catch (exception) {
            throw exception;
        }
    }
    deleteSlotById = async (id) => {

        try {
            const result = await Slot.destroy({
                where: {
                    slot_id: id // Specify the ID of the banner to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Slot already deleted or does not exists.", status: "SLOT_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };

}
const slotSvc = new SlotService();
module.exports = { slotSvc };