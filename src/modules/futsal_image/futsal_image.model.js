const { DataTypes } = require("sequelize");

const futsalImgSchema = {
    image_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    caption: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }, is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
};
const createFutsalImgModel = (sequelize) => {
    const FutsalImg = sequelize.define('Futsal_images', futsalImgSchema);
    return FutsalImg;
};

module.exports = {
    createFutsalImgModel
};
