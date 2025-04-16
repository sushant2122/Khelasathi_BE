const { DataTypes } = require("sequelize");

const futsalCourtSchema = {
    court_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Futsals',
            key: 'futsal_id'
        }
    },

    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },

};

// Function to create the model with a unique constraint on (futsal_id, service_id)
const createFutsalCourtModel = (sequelize) => {
    const FutsalCourt = sequelize.define(
        'Courts',
        futsalCourtSchema
    );
    return FutsalCourt;
};

module.exports = {
    createFutsalCourtModel
};
