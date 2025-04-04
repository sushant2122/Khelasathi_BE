const { DataTypes } = require("sequelize");

const transactionSchema = {
    transaction_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Bookings", key: "booking_id" }
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Automatically sets current timestamp
        allowNull: false
    },
    total_payment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_session_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    payment_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded", "refund-failed"),
        defaultValue: "pending"
    }
};

const createTransactionModel = (sequelize) => {
    return sequelize.define("Transactions", transactionSchema, {
        tableName: "Transactions",
        timestamps: false
    });
};

module.exports = { createTransactionModel };
