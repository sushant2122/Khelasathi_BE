const { DataTypes, Sequelize } = require("sequelize");

const userSchema = {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    contact_number: {
        type: DataTypes.STRING(20)
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    date_joined: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles',  // Ensure this refers to the actual table name ('Roles')
            key: 'role_id'
        }
    }
};

const createUserModel = async (sequelize) => {
    const User = sequelize.define('User', userSchema);
    return User;
};

module.exports = {
    createUserModel
};
