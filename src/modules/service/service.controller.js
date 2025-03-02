

const { Op } = require("sequelize"); // Import Sequelize operators
const { serviceSvc } = require("./service.service");
class ServiceController {
    /**
     *  * this function is used to show the banners by logged in user
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

            let filter = {};

            if (req.query.search) {
                filter = {
                    ...filter,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${req.query.search}%` } }, // Case-insensitive LIKE search
                    ]
                };
            }

            // Handle the 'is_active' filter
            if (req.query.status !== undefined) {
                const status = req.query.status === 'true' ? true : req.query.status === 'false' ? false : undefined;
                if (status !== undefined) {
                    filter.is_active = status;
                }
            }

            // Fetch the list and total count of banners
            const { list, total } = await serviceSvc.listAllByFilter({ limit, offset, filter });

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
                message: "List all service.",
                status: "SERVICE_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     *  * this function is to create banners by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {
        try {
            const data = req.body;
            const service = await serviceSvc.createService(data);
            res.json({
                result: service,
                meta: null,
                message: "service created successfully.",
                status: "SERVICE_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        }

    }

    /**
     *  this function is used to update a banner data by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    update = async (req, res, next) => {
        try {

            const service_id = req.params.id;
            const data = req.body;
            const service = await serviceSvc.updateService(service_id, data);
            res.json({
                result: service,
                meta: null,
                message: "Service updated successfully.",
                status: "SERVICE_UPDATE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to remove  a banner  by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await serviceSvc.deleteServiceById(id);
            res.json({
                result: response,
                meta: null,
                message: "Service deleted successfully.",
                status: "SERVICE_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to fetch the active banner to display in the home page.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    listForVenue = async (req, res, next) => {
        try {
            const filter = {
                is_active: true
            }
            const service = await serviceSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: service,
                meta: null,
                message: "Service for display.",
                status: "SERVICE_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }

}
const serviceCtrl = new ServiceController();

module.exports = serviceCtrl;