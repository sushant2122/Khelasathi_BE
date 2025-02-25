const { DataTypes, Sequelize } = require("sequelize");

const serviceSchema = {

};

const createserviceModel = async (sequelize) => {
    const Service = sequelize.define('Services', serviceSchema);
    return Service;
};

module.exports = {
    createserviceModel
};
