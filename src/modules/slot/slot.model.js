const { DataTypes } = require("sequelize");

const SlotSchema = {
    slot_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    court_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courts',
            key: 'court_id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    credit_point: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
};

const createSlotModel = (sequelize) => {
    const slot = sequelize.define('Slots', SlotSchema);
    return slot
};

module.exports = {
    createSlotModel
};