const { DataTypes } = require("sequelize");

const serviceSchema = {
    service_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
};

const createserviceModel = (sequelize) => {
    const Service = sequelize.define('Services', serviceSchema);
    return Service;
};

module.exports = {
    createserviceModel
};
