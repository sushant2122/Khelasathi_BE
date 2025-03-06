
const { merchantSvc } = require("./futsal_merchant.service")
const { Op } = require("sequelize"); // Import Sequelize operators
class FutsalMerchantController {

    index = async (req, res, next) => {
        try {

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
            const { list } = await merchantSvc.listAllByFilter({ filter });


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
            const data = await merchantSvc.transformFutsalData(req);
            const futsal = await merchantSvc.createFutsal(data, req);
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal created successfully.",
                status: "FUTSAL_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

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
            const futsal = await merchantSvc.getSingleFutsalData({ futsal_id: id });
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
            const data = await merchantSvc.transformFutsalUpdateData(req);
            const futsal = await merchantSvc.updateFutsal(futsal_id, data);
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
            const response = await merchantSvc.deleteFutsalById(id);
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
            const futsal = await merchantSvc.listAllByFilter({
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
            const futsal = await merchantSvc.getSingleFutsalData({ futsal_id: id, is_active: true, verification_status: "approved" });
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
            const data = await merchantSvc.transformFutsalVerifyData(req);
            const futsal = await merchantSvc.updateFutsal(futsal_id, data);
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
const merchantCtrl = new FutsalMerchantController();

module.exports = merchantCtrl;