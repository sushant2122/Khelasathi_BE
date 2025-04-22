const slugify = require("slugify");
const { Futsal, User } = require("../../config/db.config");
const { uploadHelper } = require("../../utilities/helper")

class FutsalService {


    transformFutsalData = async (req) => {
        const data = req.body;

        data.owner_id = req.authUser.user_id;
        data.slug = slugify(data.name, { lower: true });



        if (req.files && req.files.citizenship_front_url && req.files.citizenship_front_url[0]) {

            data.citizenship_front_url = await uploadHelper(req.files.citizenship_front_url[0].path, 'futsals');
            data.citizenship_back_url = await uploadHelper(req.files.citizenship_back_url[0].path, 'futsals');
            data.image_url = await uploadHelper(req.files.image_url[0].path, 'futsals');
        } else {
            // Handle the case where no file is uploaded for this field
            delete data.image_url
            delete data.citizenship_front_url
            delete data.citizenship_back_url
            throw { code: 404, message: "File  not found.", status: "FILE_NOT_FOUND" };
        }

        return data;
    };
    transformFutsalUpdateData = async (req) => {
        const data = req.body;
        const files = req.files || {};

        if (files.citizenship_front_url?.[0]) {
            data.citizenship_front_url = await uploadHelper(files.citizenship_front_url[0].path, 'futsals');
        }

        if (files.citizenship_back_url?.[0]) {
            data.citizenship_back_url = await uploadHelper(files.citizenship_back_url[0].path, 'futsals');
        }

        if (files.image_url?.[0]) {
            data.image_url = await uploadHelper(files.image_url[0].path, 'futsals');
        }

        return data;
    };
    transformFutsalVerifyData = async (req) => {
        const data = req.body;
        data.verification_date = new Date();
        return data;
    };

    createFutsal = async (data, req) => {
        try {
            // Check if the futsal with the same slug already exists
            const existingData = await Futsal.findOne({
                where: { slug: data.slug }
            });

            // Check if the user already has a registered futsal (only for users with role 'Venue')
            const FutsalRegistered = await Futsal.findOne({
                where: { owner_id: req.authUser.user_id }
            });

            // If a futsal is already registered, throw an error
            if (FutsalRegistered && req.authUser.role_title === 'Venue') {
                throw {
                    code: 400,
                    detail: "Futsal already registered from this account.",
                    status: "FUTSAL_CAN_NOT_BE_REGISTERED"
                };
            }

            // If futsal with the same slug exists, throw an error
            if (existingData) {
                throw {
                    code: 400,
                    detail: { slug: `${data.slug} already exists. Please enter a different futsal name.` },
                    status: "FUTSAL_ALREADY_EXISTS"
                };
            }

            // Create new futsal if no issues
            const newFutsal = await Futsal.create(data);
            return newFutsal;

        } catch (exception) {
            throw exception;
        }
    };

    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Futsal.count({
                where: filter
            });

            const list = await Futsal.findAll({
                where: filter,
                include: [
                    {
                        model: User,
                        attributes: ['user_id', 'email', 'role_title']
                    }
                ],
                order: [['createdAt', 'DESC']], // Sorting by createdAt descending
                limit: limit,
                offset: offset
            });

            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };

    getSingleFutsalData = async (filter) => {
        try {
            const futsalDetail = await Futsal.findOne({
                where: filter,
                include: [
                    {
                        model: User, // Assuming 'User' is the model for the 'createdBy' association
                        // as: 'createdBy', // The alias defined in the association
                        attributes: ['user_id', 'full_name', 'email', 'role_title'], // Selecting specific fields
                    }
                ]
            });

            if (!futsalDetail) {
                throw ({ code: 404, message: "Futsal does not exists.", status: "FUTSAL_NOT_FOUND" });
            } else {
                return futsalDetail;
            }

        } catch (exception) {
            throw exception;
        }
    }
    updateFutsal = async (futsalId, data) => {
        try {
            // First, make sure the futsal exists
            const futsal = await Futsal.findByPk(futsalId);

            if (!futsal) {
                throw { code: 400, message: "Futsal not found", status: "FUTSAL_NOT_FOUND" };
            }

            // Now update the FUTSAL with the new data
            const updatedFutsal = await futsal.update(data);

            return updatedFutsal;

        } catch (exception) {
            throw exception;
        }
    }
    deleteFutsalById = async (futsal_id) => {

        try {
            const result = await Futsal.destroy({
                where: {
                    futsal_id: futsal_id // Specify the ID of the futsal to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Futsal already deleted or does not exists.", status: "FUTSAL_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };

}
const futsalSvc = new FutsalService();
module.exports = { futsalSvc };