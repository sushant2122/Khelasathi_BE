const { Op } = require("sequelize"); // Import Sequelize operators
const { courtSvc } = require("./court.service");

class FutsalCourtController {
    /**
     * This function is used to list all courts based on filters.
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     * @return {void} 
     */
    index = async (req, res, next) => {
        try {
            let filter = {
                futsal_id: req.authUser.futsal_id
            };



            // Fetch the list of courts based on the filter
            const { list } = await courtSvc.listAllByFilter(filter);

            res.json({
                result: list,
                meta: null,
                message: "List all courts.",
                status: "COURT_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };

    /**
     * This function is used to create a new court.
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     * @return {void} 
     */
    store = async (req, res, next) => {
        try {
            const data = await courtSvc.transformCourtData(req);
            const court = await courtSvc.createCourt(data);
            res.json({
                result: court,
                meta: null,
                message: "Court created successfully.",
                status: "COURT_CREATION_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     * This function is used to update a court's data.
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     * @return {void} 
     */
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const court = await courtSvc.updateCourt(id, data);
            res.json({
                result: court,
                meta: null,
                message: "Court updated successfully.",
                status: "COURT_UPDATE_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };

    /**
     * This function is used to delete a court.
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     * @return {void} 
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await courtSvc.deleteCourtById(id);
            res.json({
                result: response,
                meta: null,
                message: "Court deleted successfully.",
                status: "COURT_DELETE_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };

    /**
     * This function is used to fetch active courts for display on the home page.
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     * @return {void} 
     */
    showForHome = async (req, res, next) => {
        try {
            const id = req.params.id;
            const { list } = await courtSvc.listAllByFilter({ futsal_id: id });
            res.json({
                result: list,
                meta: null,
                message: "Court for display.",
                status: "COURT_FETCHED"
            });
        } catch (exception) {
            next(exception);
        }
    };
}

const futsalCourtCtrl = new FutsalCourtController();
module.exports = { futsalCourtCtrl };