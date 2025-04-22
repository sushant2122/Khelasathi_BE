const { DataTypes } = require("sequelize");

const bookingSchema = {
    booking_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    booked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Exact timestamp when the booking was made
        allowNull: false
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_points_collected: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show'),
        defaultValue: 'pending'
    }
};

const createBookingModel = (sequelize) => {
    const Booking = sequelize.define('Bookings', bookingSchema, {
        tableName: 'Bookings',
        timestamps: false
    });

    Booking.associate = (models) => {
        Booking.hasMany(models.Booked_slot, {
            foreignKey: 'booking_id',
            as: 'booked_slots'  //  defining the alias
        });
        Booking.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
    };

    return Booking;
};
module.exports = {
    createBookingModel
};
