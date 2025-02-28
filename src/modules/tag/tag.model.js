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
        unique: true
    }

};
const createTagModel = (sequelize) => {
    const Tag = sequelize.define('Tags', tagSchema);
    return Tag;
};

module.exports = {
    createTagModel
};
