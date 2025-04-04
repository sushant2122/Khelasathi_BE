
//uncomment one by one where you are working
const { Sequelize } = require("sequelize");
const { createRoleModel } = require("../modules/role/role.model");
const { createUserModel } = require("../modules/user/user.model");

const { seedRoles } = require("../seeding/role.seeding");
const { seedAdminUser } = require("../seeding/admin.seeding");
const { createBannerModel } = require("../modules/banner/banner.model");
const { createTagModel } = require("../modules/tag/tag.model"); //
const { createFutsalModel } = require("../modules/futsal/futsal.model");
const { createFutsalImgModel } = require("../modules/futsal_image/futsal_image.model");
const { createFutsalCourtModel } = require("../modules/court/court.model");
const { createSlotModel } = require("../modules/slot/slot.model");
const { createClosingDayModel } = require("../modules/closing_day/closing_day.model");
const { createBookingModel } = require("../modules/booking/booking.model");
const { createBookedSlotModel } = require("../modules/booked_slots/booked_slots.model");
const { createTransactionModel } = require("../modules/transaction/transaction.model");
const { createCreditPointModel } = require("../modules/credit_point/credit_point.model");
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
const Banner = createBannerModel(sequelize);

const Tag = createTagModel(sequelize);
const Futsal = createFutsalModel(sequelize);
const Futsal_image = createFutsalImgModel(sequelize);

const Court = createFutsalCourtModel(sequelize);
const Slot = createSlotModel(sequelize);
const Closing_day = createClosingDayModel(sequelize);
const Booking = createBookingModel(sequelize);
const Booked_slot = createBookedSlotModel(sequelize);
const Transaction = createTransactionModel(sequelize);
const Credit_point = createCreditPointModel(sequelize);

//relation defined for user and role
User.belongsTo(Role, { foreignKey: "role_title" });  // User belongs to Role
Role.hasMany(User, { foreignKey: "role_title" });    // Role has many Users


//relation defined for user and banner
Banner.belongsTo(User, { foreignKey: "created_by", as: "createdBy" }); // One Banner belongs to one User
User.hasMany(Banner, { foreignKey: "created_by", as: "createdBy" });  // One User has many Banners


// //relation defined for user and futsal one user can have only one futsal
User.hasOne(Futsal, { foreignKey: "owner_id" });
Futsal.belongsTo(User, { foreignKey: "owner_id" });


// //relation defined between futsal and futsla image one futsal can have many images 
Futsal_image.belongsTo(Futsal, { foreignKey: "futsal_id" });
Futsal.hasMany(Futsal_image, { foreignKey: "futsal_id" });

// //relation defined for futsal and court
Court.belongsTo(Futsal, { foreignKey: "futsal_id" }); // One Banner belongs to one User
Futsal.hasMany(Court, { foreignKey: "futsal_id" });  // One User has many Banners

// //relation between court and slot 
Slot.belongsTo(Court, { foreignKey: "court_id" }); // One Banner belongs to one User
Court.hasMany(Slot, { foreignKey: "court_id" });  // One User has many Banners

// //relation between court and closing days
Closing_day.belongsTo(Court, { foreignKey: "court_id" }); // One Banner belongs to one User
Court.hasMany(Closing_day, { foreignKey: "court_id" });  // One User has many Banners

// //relation defined between futsal and tags through futsal tags table as it has many to many relationship
// Define associations properly
Futsal.hasMany(Tag, { foreignKey: "futsal_id" });
Tag.belongsTo(Futsal, { foreignKey: "futsal_id" });


Transaction.belongsTo(Booking, { foreignKey: "booking_id" });
Booking.hasOne(Transaction, { foreignKey: "booking_id" });


Credit_point.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Credit_point, { foreignKey: "user_id" });

Booked_slot.belongsTo(Booking, { foreignKey: "booking_id" });
Booking.hasMany(Booked_slot, {
    foreignKey: "booking_id",
    as: 'booked_slots'  // Add this to match your include
});


// Fix the Slot association (was using booking_id incorrectly):
Booked_slot.belongsTo(Slot, { foreignKey: "slot_id" });
Slot.hasMany(Booked_slot, { foreignKey: "slot_id" });


// User association is correct:
Booking.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Booking, { foreignKey: "user_id" });


Credit_point.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Credit_point, { foreignKey: "user_id" });


const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Connected to PostgreSQL database.");

        // Sync database
        await sequelize.sync({ alter: true });

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
    Role,
    Banner,

    Tag,
    Futsal,

    Futsal_image,
    Court,
    Slot,
    Closing_day,
    Booking,
    Booked_slot,
    Transaction,
    Credit_point

};
