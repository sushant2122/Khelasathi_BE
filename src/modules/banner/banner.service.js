const { Banner, User } = require("../../config/db.config");
const { uploadHelper } = require("../../utilities/helper")

class BannerService {
    transformBannerData = async (req) => {
        const data = req.body;
        data.created_by = req.authUser.user_id;
        if (req.file) {
            data.image_url = await uploadHelper(req.file.path, 'banners');
        }
        else {
            delete data.image_url
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
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Banner.count({
                where: filter
            });

            const list = await Banner.findAll({
                where: filter,
                include: [
                    {
                        model: User,
                        as: 'createdBy',
                        attributes: ['user_id', 'email', 'role_title']
                    }
                ],
                order: [['createdAt', 'DESC']], // Sorting by createdAt descending
                limit: limit,
                offset: offset
            });

            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };

    getSingleBannerData = async (filter) => {
        try {
            const bannerDetail = await Banner.findOne({
                where: filter,
                include: [
                    {
                        model: User, // Assuming 'User' is the model for the 'createdBy' association
                        as: 'createdBy', // The alias defined in the association
                        attributes: ['user_id', 'full_name', 'email', 'role_title'], // Selecting specific fields
                    }
                ]
            });

            if (!bannerDetail) {
                throw ({ code: 404, message: "Banner does not exists.", status: "BANNER_NOT_FOUND" });
            } else {
                return bannerDetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateBanner = async (Id, data) => {
        try {
            // First, make sure the banner exists
            const banner = await Banner.findByPk(Id);

            if (!banner) {
                throw { code: 400, message: "Banner not found", status: "BANNER_NOT_FOUND" };
            }

            // Now update the banner with the new data
            const updatedBanner = await banner.update(data);

            return updatedBanner;

        } catch (exception) {
            throw exception;
        }
    }
    deleteBannerById = async (banner_id) => {

        try {
            const result = await Banner.destroy({
                where: {
                    banner_id: banner_id // Specify the ID of the banner to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Banner already deleted or does not exists.", status: "BANNER_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };
}
const bannerSvc = new BannerService();
module.exports = { bannerSvc };