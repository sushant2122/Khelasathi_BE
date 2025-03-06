const { DataTypes } = require("sequelize");

const futsalMerchantSchema = {
    payment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    futsal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Futsals',
            key: 'futsal_id'
        }
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Services',
            key: 'service_id'
        }
    },
    payment_client_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    payment_client_secret: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
};

// Function to create the model with a unique constraint on (futsal_id, service_id)
const createFutsalMerchantModel = (sequelize) => {
    const FutsalMerchant = sequelize.define(
        'Futsal_merchants',
        futsalMerchantSchema,
        {
            indexes: [
                {
                    unique: true,
                    fields: ['futsal_id', 'service_id']  // to ensure one futsal can have only one row per service
                }
            ]
        }
    );
    return FutsalMerchant;
};

module.exports = {
    createFutsalMerchantModel
};
