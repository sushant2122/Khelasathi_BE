const { DataTypes, Sequelize } = require("sequelize");

const bannerSchema = {

};

const createBannerModel = async (sequelize) => {
    const Banner = sequelize.define('Banners', bannerSchema);
    return Banner;
};

module.exports = {
    createBannerModel
};
