

const { Sequelize } = require("sequelize");
const { createRoleModel } = require("../modules/role/role.model");
const { createUserModel } = require("../modules/user/user.model");
const { seedRoles } = require("../seeding/role.seeding");
const { seedAdminUser } = require("../seeding/admin.seeding");

const sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        dialect: process.env.PG_DIALECT,
        logging: false,  // Disable logging for cleaner console output
    }
);

// Create models once and export them
const Role = createRoleModel(sequelize);
const User = createUserModel(sequelize);

// Define relationships once
User.belongsTo(Role, { foreignKey: "role_title" });  // User belongs to Role
Role.hasMany(User, { foreignKey: "role_title" });    // Role has many Users

const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Connected to PostgreSQL database.");

        // Sync database
        await sequelize.sync();

        // Seed database
        await seedRoles(Role);
        await seedAdminUser(User, Role);

        console.log("✅ Database synced and seeded.");
    } catch (error) {
        console.error("❌ Error connecting to PostgreSQL database:", error);
    }
};

// Initialize DB
initDb();

// Export models & sequelize connection
module.exports = {
    sequelize,
    User,
    Role
};
