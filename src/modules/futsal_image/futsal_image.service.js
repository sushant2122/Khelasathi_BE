const { Futsal_image } = require("../../config/db.config");
const { uploadHelper } = require("../../utilities/helper")

class FutsalImageService {

    transformFutsalImgData = async (req) => {
        const data = req.body;
        data.futsal_id = req.authUser.futsal_id;
        if (req.file) {
            data.image = await uploadHelper(req.file.path, 'futsal-img');
        }
        else {
            delete data.image
        }
        return data;
    }
    createFutsalImg = async (data) => {
        try {
            const newFutsalImg = await Futsal_image.create(data);
            return newFutsalImg;
        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Futsal_image.count({
                where: filter
            });

            const list = await Futsal_image.findAll({
                where: filter,
                limit: limit,
                offset: offset
            });
            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };
    getSingleFutsalImgData = async (filter) => {
        try {
            const futsalImageDetail = await Futsal_image.findOne({
                where: filter
            });

            if (!futsalImageDetail) {
                throw ({ code: 404, message: "Futsal image does not exists.", status: "FUTSAL_IMAGE_NOT_FOUND" });
            } else {
                return futsalImageDetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateFutsalImg = async (image_id, data) => {
        try {
            // First, make sure the banner exists
            const futsalImg = await Futsal_image.findByPk(image_id);

            if (!futsalImg) {
                throw { code: 400, message: "Futsal image not found", status: "FUTSAL_IMAGE_NOT_FOUND" };
            }

            // Now update the banner with the new data
            const updatedFutsalImg = await Futsal_image.update(data, {
                where: { image_id: image_id },
                returning: true  // Add the 'where' clause
            });

            return updatedFutsalImg;

        } catch (exception) {
            throw exception;
        }
    }
    deleteFutsalImgById = async (futsalimg_id) => {

        try {
            const result = await Futsal_image.destroy({
                where: {
                    image_id: futsalimg_id // Specify the ID of the banner to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Futsal image already deleted or does not exists.", status: "FUTSAL_IMAGE_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };
}
const futsalImgSvc = new FutsalImageService();
module.exports = { futsalImgSvc };