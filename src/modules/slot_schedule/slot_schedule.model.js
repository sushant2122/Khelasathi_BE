const { DataTypes } = require("sequelize");

const SlotScheduleSchema = {
    schedule_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Slots',
            key: 'slot_id'
        }
    },
    week_day: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

};

// Function to create the model with a unique constraint on (futsal_id, service_id)
const createSlotScheduleModel = (sequelize) => {
    const SlotSchedule = sequelize.define(
        'slot_schedules',
        SlotScheduleSchema
    );
    return SlotSchedule;
};

module.exports = {
    createSlotScheduleModel
};
