const { DataTypes } = require("sequelize");

const creditPointSchema = {
    credit_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "user_id" }
    },
    credit_session_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    transaction_type: {
        type: DataTypes.ENUM("earned", "redeemed"),
        allowNull: false
    },
    credit_amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
};

const createCreditPointModel = (sequelize) => {
    return sequelize.define("CreditPoints", creditPointSchema, {
        tableName: "Credit_points",
        timestamps: false // No createdAt and updatedAt columns for this table
    });
};

module.exports = { createCreditPointModel };
