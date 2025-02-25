
const { DataTypes } = require('sequelize');

const RoleEnum = ['Admin', 'Venue', 'Player'];
const roleSchema = {
    role_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.ENUM(...RoleEnum),
        allowNull: false
    },
    description: { type: DataTypes.TEXT }

}

const createRoleModel = async (sequelize) => {
    const Role = sequelize.define('Role', roleSchema);
    return Role;

}
module.exports = {
    createRoleModel
}