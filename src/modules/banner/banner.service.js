const { Banner } = require("../../config/db.config");
const { uploadHelper } = require("../../utilities/helper")

class BannerService {

    transformBannerData = async (req) => {
        const data = req.body;
        data.created_by = req.authUser.user_id;

        if (req.file) {
            data.image_url = await uploadHelper(req.file.path, 'banners');
        }
        return data;
    }
    createBanner = async (data) => {
        try {
            const newBanner = await Banner.create(data);
            return newBanner;

        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async (filter = {}) => {
        try {
            const list = await Banner.findAll({
                where: filter,
                include: [
                    {
                        model: User,
                        as: "created_by",
                        attributes: ["user_id", "email", "role"]
                    }
                ]
            });

            return list;
        } catch (exception) {
            throw exception;
        }
    };



}
const bannerSvc = new BannerService();
module.exports = { bannerSvc };