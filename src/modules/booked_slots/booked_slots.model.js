const { DataTypes } = require("sequelize");

const bookedSlotSchema = {
    booked_slot_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Bookings", key: "booking_id" }
    },
    slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Slots", key: "slot_id" }
    },
    sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

};

const createBookedSlotModel = (sequelize) => {
    const BookedSlot = sequelize.define("BookedSlots", bookedSlotSchema, {
        tableName: "Booked_slots",
        timestamps: false
    });

    BookedSlot.associate = (models) => {
        BookedSlot.belongsTo(models.Booking, {
            foreignKey: 'booking_id'
        });
        BookedSlot.belongsTo(models.Slot, {
            foreignKey: 'slot_id'
        });
    };

    return BookedSlot;
};

module.exports = { createBookedSlotModel };
