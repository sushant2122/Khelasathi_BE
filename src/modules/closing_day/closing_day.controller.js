
const { Op } = require("sequelize"); // Import Sequelize operators
const { closingSvc } = require("./closing_day.service");
class ClosingDayController {
    /**
     *  * this function is used to show the banners by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    index = async (req, res, next) => {
        try {

            let filter = {};

            if (req.query.court_id) {
                filter = {
                    ...filter,
                    court_id: req.query.court_id
                };
            }

            // Fetch the list and total count of banners
            const { list } = await closingSvc.listAllByFilter(filter);

            res.json({
                result: list,
                meta: null,
                message: "List all closing days.",
                status: "CLOSING_DAY_LIST_SUCCESS"
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
            const closing = await closingSvc.createClosingDay(data);
            res.json({
                result: closing,
                meta: null,
                message: "Closing day created successfully.",
                status: "CLOSING_DAY_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        }

    }
    /**
     *  this function is used to show the details of the banner by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    show = async (req, res, next) => {
        try {
            const id = req.params.id;
            const closing = await closingSvc.getSingleClosingData({ closing_day_id: id });
            res.json({
                result: closing,
                meta: null,
                message: "Closing day details.",
                status: "CLOSING_DAY_FOUND"
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

            const id = req.params.id;
            const data = req.body;
            const closing = await closingSvc.updateClosing(id, data);
            res.json({
                result: closing,
                meta: null,
                message: "Closing day updated successfully.",
                status: "CLOSING_DAY_UPDATE_SUCCESS"
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
            const response = await closingSvc.deleteClosingById(id);
            res.json({
                result: response,
                meta: null,
                message: "Closing day deleted successfully.",
                status: "CLOSING_DAY_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }


}
const closingCtrl = new ClosingDayController();

module.exports = closingCtrl;