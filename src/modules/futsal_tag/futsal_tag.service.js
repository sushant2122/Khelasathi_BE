const { Futsal_tag, Tag } = require("../../config/db.config");
const { ValidationError } = require('sequelize'); // Sequelize validation error class

class FutsalTagService {
    transformFutsalTagDetails = async (req) => {
        const data = req.body;
        if (req.authUser.futsal_id) {
            data.FutsalFutsalId = req.authUser.futsal_id;
            return data;
        } else {
            throw { code: 400, message: "Futsal  not registered by the user", status: "FUTSAL_NOT_REGISTERED" };
        }

    }

    async createFutsalTag(Data) {
        try {
            return await Futsal_tag.create(Data);
        } catch (error) {
            if (error instanceof ValidationError && error.errors[0].type === 'unique violation') {
                // Custom error message for duplicate futsal_id and service_id
                throw { code: 409, result: error, message: "Futsal  and Service ID is already registered.", status: "FUTSAL_SERVICE_ALREADY_REGISTERED" };

            }

            throw error;
        }
    }

    listAllByFilter = async (filter = {}) => {
        try {
            const list = await Futsal_tag.findAll({
                where: filter,
                include: [
                    {
                        model: Tag,
                        attributes: ['tagname']
                    }
                ],
                order: [['createdAt', 'DESC']] // Sorting by createdAt descending
            });

            return list;
        } catch (exception) {
            throw exception;
        }
    };

    deleteFutsalTagById = async (tagid, futsalid) => {
        try {
            const futsalTag = await Futsal_tag.findOne({ where: { tag_id: tagid, futsal_id: futsalid } });

            if (!futsalTag) {
                throw { code: 400, message: "Futsal tag not found", status: "FUTSAL_TAG_NOT_FOUND" };
            }

            await futsalTag.destroy(); // Delete the record

            return { message: "Futsal tag deleted successfully." };
        } catch (exception) {
            throw exception;
        }
    };
};

const futsalTagSvc = new FutsalTagService();
module.exports = {
    futsalTagSvc
};