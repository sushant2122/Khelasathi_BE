
const { DataTypes } = require('sequelize');

const roleSchema = {
    role_title: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    description: {
        type: DataTypes.TEXT
    }
}

const createRoleModel = async (sequelize) => {
    const Role = sequelize.define('Roles', roleSchema);
    return Role;

}
module.exports = {
    createRoleModel
}