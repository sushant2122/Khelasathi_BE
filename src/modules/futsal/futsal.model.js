const { DataTypes } = require("sequelize");

const VerificationStatusEnum = ['pending', 'approved', 'rejected'];

const futsalSchema = {
    futsal_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
    },
    slug: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING(255),
    },
    maplink: {
        type: DataTypes.TEXT,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    contact_number: {
        type: DataTypes.STRING(20),
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Ensure this matches the table name of the User model
            key: 'user_id', // Ensure this matches the primary key of the User model
        },
    },
    citizenship_front_url: {
        type: DataTypes.STRING(255),
    },
    image_url: {
        type: DataTypes.STRING(255),
    },
    citizenship_back_url: {
        type: DataTypes.STRING(255),
    },
    pan_number: {
        type: DataTypes.STRING(255),
    },
    verification_status: {
        type: DataTypes.ENUM(...VerificationStatusEnum),
        defaultValue: 'pending',
    },
    verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};

const createFutsalModel = (sequelize) => {
    const Futsal = sequelize.define('Futsals', futsalSchema);
    return Futsal;
};

module.exports = {
    createFutsalModel,
};