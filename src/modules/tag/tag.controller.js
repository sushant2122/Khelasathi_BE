

const { Op } = require("sequelize"); // Import Sequelize operators
const { tagSvc } = require("./tag.service");
class tagController {
    /**
     *  * this function is used to show the tags by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    index = async (req, res, next) => {
        try {
            let page = +req.query.page || 1;
            let limit = +req.query.limit || 10;
            let offset = (page - 1) * limit; // `offset` in Sequelize is equivalent to `skip`

            let filter = { futsal_id: req.authUser.futsal_id };

            if (req.query.search) {
                filter = {
                    ...filter,
                    [Op.or]: [
                        { tagname: { [Op.iLike]: `%${req.query.search}%` } }, // Case-insensitive LIKE search
                    ]
                };
            }

            // Handle the 'is_active' filter
            if (req.query.status !== undefined) {
                const status = req.query.status === 'true' ? true : req.query.status === 'false' ? false : undefined;
                if (status !== undefined) {
                    filter.is_available = status;
                }
            }

            // Fetch the list and total count of banners
            const { list, total } = await tagSvc.listAllByFilter({ limit, offset, filter });

            // Check if the requested page exceeds the total available pages
            const totalPages = Math.ceil(total / limit);
            if (page > totalPages) {
                return next({
                    code: 404,
                    message: "No data to load for the requested page.",
                    status: "PAGINATION_ERROR"
                });
            }

            res.json({
                result: list,
                meta: {
                    limit,
                    page,
                    total,
                    totalpages: totalPages
                },
                message: "List all tag.",
                status: "TAG_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     *  * this function is to create tagds by logged in venue owner
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {
        try {
            const data = tagSvc.transformTagData(req);
            console.log(data);
            const tag = await tagSvc.createTag(data);
            res.json({
                result: tag,
                meta: null,
                message: "tag created successfully.",
                status: "tag_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        }

    }

    /**
     *  this function is used to update a tag data by the logged in venue user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    update = async (req, res, next) => {
        try {

            const tag_id = req.params.id;
            const data = req.body;
            const tag = await tagSvc.updateTag(tag_id, data);
            res.json({
                result: tag,
                meta: null,
                message: "tag updated successfully.",
                status: "TAG_UPDATE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to remove  a tag  by the logged in venue user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await tagSvc.deleteTagById(id);
            res.json({
                result: response,
                meta: null,
                message: "tag deleted successfully.",
                status: "TAG_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to fetch the active tag to display in the home page.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    listForHome = async (req, res, next) => {
        try {
            const futsal_id = req.params.id;
            const filter = {
                futsal_id: futsal_id,
                is_available: true
            }
            const tag = await tagSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: tag,
                meta: null,
                message: "tag for display.",
                status: "tag_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }

}
const tagCtrl = new tagController();

module.exports = tagCtrl;