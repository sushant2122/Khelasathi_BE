const { Op } = require("sequelize");
const { Slot } = require("../../config/db.config");

class SlotService {
    constructor(model) {
        this.model = model;
    }

    async checkOverlappingSlots(court_id, start_time, end_time, slot_id = null) {
        const whereClause = {
            court_id,
            [Op.or]: [
                {
                    start_time: { [Op.lt]: end_time },
                    end_time: { [Op.gt]: start_time }
                }
            ]
        };

        if (slot_id) {
            whereClause.id = { [Op.ne]: slot_id }; // assuming the primary key is "id"
        }

        const overlappingSlots = await this.model.findAll({
            where: whereClause
        });

        return overlappingSlots.length > 0;
    }

    async createSlot(data) {
        try {
            const isOverlapping = await this.checkOverlappingSlots(
                data.court_id,
                data.start_time,
                data.end_time
            );

            if (isOverlapping) {
                throw new Error('Time slot overlaps with an existing slot for this court');
            }

            const newSlot = await this.model.create(data);
            return newSlot;
        } catch (exception) {
            throw exception;
        }
    }

    async updateSlot(slot_id, data) {
        try {

            const [updated] = await this.model.update(data, {
                where: { slot_id: slot_id } // assuming 'id' is the primary key
            });

            if (!updated) {
                throw new Error('Slot not found');
            }

            return await this.model.findByPk(slot_id);
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
const slotSvc = new SlotService(Slot);
module.exports = { slotSvc };