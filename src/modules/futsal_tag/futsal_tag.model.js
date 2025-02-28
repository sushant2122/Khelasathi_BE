const { DataTypes } = require("sequelize");

const futsalTagSchema = {
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Futsals',
            key: 'futsal_id'
        }
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Tags',
            key: 'tag_id'
        }
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
