const { DataTypes } = require("sequelize");
const VerificationStatusEnum = ['pending', 'approved', 'rejected'];
const futsalSchema = {
    futsal_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    slug: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,

    },
    location: {
        type: DataTypes.STRING(255)
    },
    maplink: {
        type: DataTypes.TEXT
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    contact_number: {
        type: DataTypes.STRING(20)
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'user_id'
        }
    },
    citizenship_front_url: {
        type: DataTypes.STRING(255)
    },
    citizenship_back_url: {
        type: DataTypes.STRING(255)
    },
    pan_number: {
        type: DataTypes.STRING(255)
    },
    verification_status: {
        type: DataTypes.ENUM(...VerificationStatusEnum),
        defaultValue: 'pending'
    },
    verification_date: {
        type: DataTypes.DATE
    }
};

const createFutsalModel = (sequelize) => {
    const Futsal = sequelize.define('Futsals', futsalSchema);
    return Futsal;
};

module.exports = {
    createFutsalModel
};
