const { fileDelete } = require("../../utilities/helper");
const { futsalSvc } = require("./futsal.service")
const { Op } = require("sequelize"); // Import Sequelize operators
class FutsalController {
    /**
     *  * this function is used to show the Futsals by logged in user
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
                        { title: { [Op.iLike]: `%${req.query.search}%` } }, // Case-insensitive LIKE search
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

            // Fetch the list and total count of futsalss
            const { list, total } = await futsalSvc.listAllByFilter({ limit, offset, filter });

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
                message: "List all futsals.",
                status: "FUTSAL_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     *  * this function is to create futsals by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {

        try {
            const data = await futsalSvc.transformFutsalData(req);
            const futsal = await futsalSvc.createFutsal(data);
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal created successfully.",
                status: "FUTSAL_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        } finally {
            if (req.files) {
                fileDelete(req.files.citizenship_front_url[0].path);
                fileDelete(req.files.citizenship_back_url[0].path);
            }
        }

    }
    /**
     *  this function is used to show the details of the futsal by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    show = async (req, res, next) => {
        try {
            const id = req.params.id;
            const futsal = await futsalSvc.getSingleFutsalData({ futsal_id: id });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to update a futsal data by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    update = async (req, res, next) => {
        try {

            const futsal_id = req.params.id;
            const data = await futsalSvc.transformFutsalUpdateData(req);
            const futsal = await futsalSvc.updateFutsal(futsal_id, data);
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal updated successfully.",
                status: "FUTSAL_UPDATE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to remove  a futsal  by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await futsalSvc.deleteFutsalById(id);
            res.json({
                result: response,
                meta: null,
                message: "Futsal deleted successfully.",
                status: "FUTSAL_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to fetch the active futsal to display in the home page.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    listForHome = async (req, res, next) => {
        try {
            const filter = {
                is_active: true,
                verification_status: "approved"
            }
            const futsal = await futsalSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal for display.",
                status: "FUTSAL_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }
    showForHome = async (req, res, next) => {
        try {
            const id = req.params.id;
            const futsal = await futsalSvc.getSingleFutsalData({ futsal_id: id, is_active: true, verification_status: "approved" });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    };

    verify = async (req, res, next) => {
        try {

            const futsal_id = req.params.id;
            const data = await futsalSvc.transformFutsalVerifyData(req);
            const futsal = await futsalSvc.updateFutsal(futsal_id, data);
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal verified successfully.",
                status: "FUTSAL_VERIFICATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }

}
const futsalCtrl = new FutsalController();

module.exports = futsalCtrl;