const { DataTypes } = require("sequelize");

const ClosingDaySchema = {
    closing_day_id: {
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
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: false
    },


};

// Function to create the model with a unique constraint on (futsal_id, service_id)
const createClosingDayModel = (sequelize) => {
    const ClosingDay = sequelize.define(
        'Closing_days',
        ClosingDaySchema
    );
    return ClosingDay;
};

module.exports = {
    createClosingDayModel
};
