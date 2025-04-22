const { Status } = require("../../config/constants.config");
const { User } = require("../../config/db.config");
const { uploadHelper, randomStringGenerator } = require("../../utilities/helper")
const bcrypt = require("bcryptjs");
class AuthService {

    transformUserDetails = async (req) => {

        const data = req.body

        if (req.file) {
            data.profile_img = await uploadHelper(req.file.path);
        }

        data.password = bcrypt.hashSync(data.password, 10);
        //bcrypt =>user -createdtime,ipaddress,salt,hash func

        data.activationtoken = randomStringGenerator(100)
        //willl be useful in reschedule and cancellation
        data.activefor = new Date(Date.now() + (60 * 60 * 3 * 1000))

        data.is_verified = Status.INACTIVE;

        return data;
    }

    transformUpdateUserDetails = async (req) => {
        const data = req.body;
        if (req.file) {
            data.profile_img = await uploadHelper(req.file.path);
        }
        return data;
    }

    createUser = async (userData, next) => {
        try {
            // Check if a user with the given email already exists
            const existingUser = await User.findOne({
                where: { email: userData.email }
            });

            if (existingUser) {
                // If email exists, pass error to next middleware
                const detail = { email: userData.email + " already exists." }; // Prepare details for the error response
                const error = new Error('User with this email already exists.');
                error.code = 400; // Custom HTTP status for this error
                error.detail = detail;
                error.status = "EMAIL_ALREADY_EXISTS";
                // Add extra details for the error
                return next(error); // Pass the error to Express's error handler
            }

            // If no existing user, create a new user
            const newUser = await User.create(userData);

            return newUser;

        } catch (error) {
            console.error('❌ Error creating user:', error);
            throw error; // Let the controller handle unexpected errors
        }
    };

    getSingleUserByFilter = async (filter) => {
        try {
            const user = await User.findOne({
                where: filter
            });

            if (!user) {
                throw ({ code: 400, message: "User not found", status: "USER_NOT_FOUND" })
            } else {
                return user;
            }

        } catch (exception) {
            throw exception;

        }
    }

    updateUserById = async (filter, data) => {
        try {
            // Find the user by the given ID
            const user = await User.findOne({
                where: filter
            });
            // If user is not found, throw an error
            if (!user) {
                throw ({ code: 404, message: "User not found", status: "USER_NOT_FOUND" });
            }

            // Update the user's details with the provided data
            const updatedUser = await user.update(data);

            return updatedUser;

        } catch (exception) {
            throw exception;
        }
    }


}
const authSvc = new AuthService();
module.exports = {
    authSvc
}