// db.config.js

const { Sequelize } = require('sequelize');
const { createRoleModel } = require("../modules/role/role.model");
const { createUserModel } = require('../modules/user/user.model');
const { seedRoles } = require('../seeding/role.seeding');
const { seedAdminUser } = require('../seeding/admin.seeding');

const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    dialect: process.env.PG_DIALECT
});

let roleModel = null;
let userModel = null;

const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL database.');

        // Create models
        roleModel = await createRoleModel(sequelize);
        userModel = await createUserModel(sequelize);

        // Associate models
        userModel.belongsTo(roleModel, { foreignKey: 'role_id' });  // User belongs to Role
        roleModel.hasMany(userModel, { foreignKey: 'role_id' });    // Role has many Users

        // Sync database
        await sequelize.sync();

        // Seed roles
        await seedRoles(roleModel);  // Ensure roles are seeded only after initialization

        await seedAdminUser(userModel, roleModel);

        console.log("✅ Database synced");
    } catch (error) {
        console.error('❌ Error connecting to PostgreSQL database:', error);
    }
};

initDb();

module.exports = {
    sequelize,
    roleModel,
    userModel
};
