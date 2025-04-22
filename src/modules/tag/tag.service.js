
const { Tag } = require("../../config/db.config");

class TagService {
    transformTagData = (req) => {
        const data = req.body;
        data.futsal_id = req.authUser.futsal_id;
        return data;

    }
    createTag = async (data) => {
        try {
            const newtag = await Tag.create(data);
            return newtag;
        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Tag.count({
                where: filter
            });

            const list = await Tag.findAll({
                where: filter,
                order: [['createdAt', 'DESC']], // Sorting by createdAt descending
                limit: limit,
                offset: offset
            });

            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };
    updateTag = async (TagId, data) => {
        try {
            // First, make sure the Service exists
            const tag = await Tag.findByPk(TagId);

            if (!tag) {
                throw { code: 400, message: "Tag not found", status: "TAG_NOT_FOUND" };
            }

            // Now update the Service with the new data
            const updatedTag = await tag.update(data);

            return updatedTag;

        } catch (exception) {
            throw exception;
        }
    }
    deleteTagById = async (Tag_id) => {

        try {
            const result = await Tag.destroy({
                where: {
                    tag_id: Tag_id // Specify the ID of the Service to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Tag already deleted or does not exists.", status: "TAG_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };
}
const tagSvc = new TagService();
module.exports = { tagSvc };