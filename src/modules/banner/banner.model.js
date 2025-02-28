const { DataTypes, Sequelize } = require("sequelize");

const bannerSchema = {
    banner_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255)

    },
    description: {
        type: DataTypes.TEXT
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
            model: Users,
             key: 'user_id' 
            }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }


};

const createBannerModel = async (sequelize) => {
    const Banner = sequelize.define('Banners', bannerSchema);
    return Banner;
};

module.exports = {
    createBannerModel
};
