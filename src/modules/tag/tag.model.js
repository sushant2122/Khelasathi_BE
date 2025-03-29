const { DataTypes } = require("sequelize");
const tagSchema = {
    tag_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tagname: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

};
const createTagModel = (sequelize) => {
    const Tag = sequelize.define('Tags', tagSchema);
    return Tag;
};

module.exports = {
    createTagModel
};
