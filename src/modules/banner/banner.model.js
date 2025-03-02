const { DataTypes } = require("sequelize");

const bannerSchema = {
    banner_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255)

    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

    //createdAt and updatedAt will be default
};

const createBannerModel = (sequelize) => {
    const Banner = sequelize.define('Banners', bannerSchema);
    return Banner;
};

module.exports = {
    createBannerModel
};
