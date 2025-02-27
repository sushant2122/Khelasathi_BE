const { DataTypes } = require("sequelize");
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
    role_title: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Roles',  // Ensure this refers to the actual table name ('Roles')
            key: 'role_title'
        }
    },
    profile_img: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    activationtoken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    activefor: {
        type: DataTypes.DATE,
    },
    resettoken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    reset_activefor: {
        type: DataTypes.DATE,
    },

};

const createUserModel = (sequelize) => {
    const User = sequelize.define('Users', userSchema);
    return User;
};

module.exports = {
    createUserModel
};
