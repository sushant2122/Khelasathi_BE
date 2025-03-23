
const { Op } = require("sequelize"); // Import Sequelize operators
const { scheduleSvc } = require("./slot_schedule.service");
class SlotScheduleController {
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

            if (req.query.slot_id) {
                filter = {
                    ...filter,
                    slot_id: req.query.slot_id
                };
            }

            // Fetch the list and total count of banners
            const { list } = await scheduleSvc.listAllByFilter(filter);

            res.json({
                result: list,
                meta: null,
                message: "List all slot schedules.",
                status: "SLOT_SCHEDULE_LIST_SUCCESS"
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
            const schedule = await scheduleSvc.createSchedule(data);
            res.json({
                result: schedule,
                meta: null,
                message: "Slot schedule created successfully.",
                status: "SLOT_SCHEDULE_CREATION_SUCCESS"
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
            const schedule = await scheduleSvc.getSingleScheduleData({ schedule_id: id });
            res.json({
                result: schedule,
                meta: null,
                message: "Slot schedule details.",
                status: "SLOT_SCHEDULE_FOUND"
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
            const schedule = await scheduleSvc.updateSchedule(id, data);
            res.json({
                result: schedule,
                meta: null,
                message: "Slot schedule updated successfully.",
                status: "SLOT__SCHEDULE_UPDATE_SUCCESS"
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
            const response = await scheduleSvc.deleteScheduleById(id);
            res.json({
                result: response,
                meta: null,
                message: "Slot schedule deleted successfully.",
                status: "SLOT_SCHEDULE_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }


}
const scheduleCtrl = new SlotScheduleController();

module.exports = scheduleCtrl;