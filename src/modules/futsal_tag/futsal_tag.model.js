const { DataTypes } = require("sequelize");

const futsalTagSchema = {
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

const createFutsalTagModel = (sequelize) => {
    const FutsalTag = sequelize.define('FutsalTags', futsalTagSchema, {
        timestamps: false // Disabling timestamps for not having createdAt and updatedAt junction table
    });
    return FutsalTag;
};

module.exports = {
    createFutsalTagModel
};
