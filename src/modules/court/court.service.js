const { Court } = require("../../config/db.config");

class CourtService {
    /**
     * Transform court data from the request.
     * @param {import("express").Request} req 
     * @returns {Object} Transformed data
     */
    transformCourtData = async (req) => {
        const data = req.body;
        data.futsal_id = req.authUser.futsal_id;
        return data;
    };

    /**
     * Create a new court.
     * @param {Object} data 
     * @returns {Object} Created court
     */
    createCourt = async (data) => {
        try {
            // Check if the court with the same title already exists
            const existingData = await Court.findOne({
                where: { title: data.title }
            });

            // If court with the same title exists, throw an error
            if (existingData) {
                throw {
                    code: 400,
                    detail: existingData,
                    status: "COURT_ALREADY_EXISTS"
                };
            }

            // Create new court if no issues
            const newCourt = await Court.create(data);
            return newCourt;
        } catch (exception) {
            throw exception;
        }
    };

    /**
     * List all courts based on the provided filter.
     * @param {Object} filter 
     * @returns {Object} List of courts
     */
    listAllByFilter = async (filter = {}) => {
        try {

            const list = await Court.findAll({ where: filter }); // Debugging log

            return { list };
        } catch (exception) {
            throw exception;
        }
    };

    /**
     * Get a single court's details.
     * @param {Object} filter 
     * @returns {Object} Court details
     */
    getSingleCourtData = async (filter) => {
        try {
            const courtDetail = await Court.findOne({
                where: filter
            });

            if (!courtDetail) {
                throw { code: 404, message: "Court does not exist.", status: "COURT_NOT_FOUND" };
            } else {
                return courtDetail;
            }
        } catch (exception) {
            throw exception;
        }
    };

    /**
     * Update a court's data.
     * @param {number} Id 
     * @param {Object} data 
     * @returns {Object} Updated court
     */
    updateCourt = async (Id, data) => {
        try {
            // First, make sure the court exists
            const court = await Court.findByPk(Id);

            if (!court) {
                throw { code: 400, message: "Court not found", status: "COURT_NOT_FOUND" };
            }

            // Now update the court with the new data
            const updatedCourt = await court.update(data);
            return updatedCourt;
        } catch (exception) {
            throw exception;
        }
    };

    /**
     * Delete a court by ID.
     * @param {number} court_id 
     * @returns {Object} Deletion result
     */
    deleteCourtById = async (court_id) => {
        try {
            const result = await Court.destroy({
                where: {
                    court_id: court_id // Specify the ID of the court to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Court already deleted or does not exist.", status: "COURT_DELETE_ERROR" };
            }

            return result;
        } catch (exception) {
            throw exception;
        }
    };
}

const courtSvc = new CourtService();
module.exports = { courtSvc };