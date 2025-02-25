const { DataTypes, Sequelize } = require("sequelize");

const tagSchema = {

};

const createTagModel = async (sequelize) => {
    const Tag = sequelize.define('Tags', tagSchema);
    return Tag;
};

module.exports = {
    createTagModel
};
