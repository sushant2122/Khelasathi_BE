const { DataTypes } = require("sequelize");

const futsalTagSchema = {
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Futsals",  // Ensure this matches the actual table name
            key: "id"
        }
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Tags",  // Ensure this matches the actual table name
            key: "tag_id"
        }
    }
};

const createFutsalTagModel = (sequelize) => {
    const FutsalTag = sequelize.define('FutsalTags', futsalTagSchema, {
        timestamps: false
    });
    return FutsalTag;
};

module.exports = {
    createFutsalTagModel
};
