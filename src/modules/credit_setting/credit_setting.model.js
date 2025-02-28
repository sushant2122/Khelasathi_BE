const { DataTypes } = require("sequelize");

const creditSettingSchema = {
    credit_setting_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Futsal,
            key: 'futsal_id'
        }
    },
    credit_points_required_for_hour: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

const createCreditSettingModel = (sequelize) => {
    const CreditSettings = sequelize.define('Credit_settings', creditSettingSchema);
    return CreditSettings;
};

module.exports = {
    createCreditSettingModel
};
