
const { Op } = require("sequelize"); // Import Sequelize operators
const { slotSvc } = require("./slot.service");
class SlotController {
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

            // Fetch the list and total count of banners
            const { list } = await slotSvc.listAllByFilter(filter);




            res.json({
                result: list,
                meta: null,
                message: "List all slots.",
                status: "SLOT_LIST_SUCCESS"
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
            const slot = await slotSvc.createSlot(data);
            res.json({
                result: slot,
                meta: null,
                message: "Slot created successfully.",
                status: "SLOT_CREATION_SUCCESS"
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
            const slot = await slotSvc.getSingleSlotData({ slot_id: id });
            res.json({
                result: slot,
                meta: null,
                message: "Slot details.",
                status: "SLOT_FOUND"
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
            const slot = await slotSvc.updateSlot(id, data);
            res.json({
                result: slot,
                meta: null,
                message: "Slot updated successfully.",
                status: "SLOT_UPDATE_SUCCESS"
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
            const response = await slotSvc.deleteSlotById(id);
            res.json({
                result: response,
                meta: null,
                message: "Slot deleted successfully.",
                status: "SLOT_DELETE_SUCCESS"
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
    listForHome = async (req, res, next) => {
        try {
            const filter = { is_active: true }
            const slot = await slotSvc.listAllByFilter(filter);
            res.json({
                result: slot,
                meta: null,
                message: "slot for display.",
                status: "SLOT_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }

}
const slotCtrl = new SlotController();

module.exports = slotCtrl;