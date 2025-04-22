
const { Op } = require("sequelize"); // Import Sequelize operators
const { slotSvc } = require("./slot.service");
const { sequelize } = require("../../config/db.config");
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

            let filter = {
                court_id: req.query.court_id
            };

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
        *  this function is used to add a slot of a court.
        * @param {import ("express").Request} req 
        *  * @param {import ("express").Response} res
        *  * @param {import ("express").NextFunction} next
        * @return {void} 
       
        */
    store = async (req, res, next) => {
        try {
            const data = req.body;

            // Validate that end time is after start time
            if (data.end_time <= data.start_time) {
                return res.status(400).json({
                    result: null,
                    meta: null,
                    message: "End time must be after start time",
                    status: "TIME_VALIDATION_ERROR"
                });
            }

            const slot = await slotSvc.createSlot(data);

            res.json({
                result: slot,
                meta: null,
                message: "Slot created successfully.",
                status: "SLOT_CREATION_SUCCESS"
            });

        } catch (exception) {
            if (exception.message.includes('overlaps')) {
                return res.status(400).json({
                    result: null,
                    meta: null,
                    message: exception.message,
                    status: "SLOT_OVERLAP_ERROR"
                });
            }
            next(exception);
        }
    }
    /**
        *  this function is used to update the details of slot.
        * @param {import ("express").Request} req 
        *  * @param {import ("express").Response} res
        *  * @param {import ("express").NextFunction} next
        * @return {void} 
       
        */
    update = async (req, res, next) => {
        try {
            const slot_id = req.params.id;
            const data = req.body;

            // Validate that end time is after start time
            if (data.end_time <= data.start_time) {
                return res.status(400).json({
                    result: null,
                    meta: null,
                    message: "End time must be after start time",
                    status: "TIME_VALIDATION_ERROR"
                });
            }

            const slot = await slotSvc.updateSlot(slot_id, data);

            res.json({
                result: slot,
                meta: null,
                message: "Slot updated successfully.",
                status: "SLOT_UPDATE_SUCCESS"
            });

        } catch (exception) {

            next(exception);
        }
    }

    /**
     *  this function is used to show the details of the slot by logged in venue owner.
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
     *  this function is used to remove  a slot  by the logged in venue owner.
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
     *  this function is used to fetch the active non booked slots.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    listForHome = async (req, res, next) => {
        try {
            const { courtId, date } = req.query;

            if (!courtId || !date) {
                return res.status(400).json({
                    result: null,
                    message: "Missing required parameters: courtId and date.",
                    status: "BAD_REQUEST"
                });
            }
            const query = `
SELECT DISTINCT s.slot_id, s.title, s.start_time, s.end_time, s.price, s.credit_point
FROM "Slots" s
WHERE s.court_id = :courtId
AND s.is_active = TRUE
AND NOT EXISTS (
    SELECT 1 
    FROM "Booked_slots" bs
    JOIN "Bookings" b ON bs.booking_id = b.booking_id
    WHERE bs.slot_id = s.slot_id
    AND b.booking_date = :date
    AND b.status NOT IN ('cancelled')
)
AND NOT EXISTS (
    SELECT 1 
    FROM "Closing_days" cd
    WHERE cd.court_id = s.court_id
    AND cd.date = :date
)
ORDER BY s.start_time;
`;

            // Use just the results, not metadata for SELECT queries
            const results = await sequelize.query(query, {
                replacements: { courtId, date },
                type: sequelize.QueryTypes.SELECT
            });

            if (!results || results.length === 0) {
                return res.status(404).json({
                    result: null,
                    message: "No available slots for the selected court and date.",
                    status: "NOT_FOUND"
                });
            }

            res.json({
                result: results,
                meta: null,
                message: "Available slots fetched.",
                status: "SLOT_FETCHED"
            });

        } catch (exception) {
            next(exception);
        }
    };
}
const slotCtrl = new SlotController();

module.exports = slotCtrl;