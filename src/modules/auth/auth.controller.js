
const { fileDelete } = require("../../utilities/helper")
const { myEvent, EventName } = require("../../middleware/events.middleware")
const { authSvc } = require("../auth/auth.service");
const { sequelize } = require("../../config/db.config");
const { createUserModel } = require("../user/user.model");
const { randomStringGenerator } = require("../../utilities/helper");
class AuthController {
    signUp = async (req, res, next) => {
        try {
            // Transform user details (including file upload if present)
            const data = await authSvc.transformUserDetails(req);

            let userModel = await createUserModel(sequelize);

            // Create the user and handle the result
            const userCreationResult = await authSvc.createUser(userModel, data, next);

            // If user creation was successful, emit the event for email
            if (userCreationResult) {
                myEvent.emit(EventName.SIGNUP_EMAIL, { name: data.firstname, email: data.email, token: data.activationtoken });

                // Respond with success message and user data
                return res.json({
                    result: data,
                    meta: null,
                    message: "Your account has been registered successfully.",
                    status: "REGISTER_SUCCESS"
                });
            }

            // If user creation failed (e.g., duplicate email), no need for additional processing
            return;

        } catch (exception) {
            // Handle any unexpected errors during the process
            console.error(exception);

            // If a file was uploaded and there's an error, delete the file
            if (req.file) {
                fileDelete(req.file.path);
            }
        }
    };

    activateUser = async (req, res, next) => {
        try {
            const token = req.params.token;
            let userModel = await createUserModel(sequelize);
            const userDetails = await authSvc.getSingleUserByFilter(userModel, { activationtoken: token });

            let tokenExpiry = new Date(userDetails.activefor);
            const today = new Date();

            if (tokenExpiry < today) {
                throw ({ code: 400, message: "Token already expired.", status: "ACTIVATION_TOKEN_EXPIRED" });
            }

            // Further logic to activate user...
            res.json({
                message: "User activated successfully",
                status: "SUCCESS"
            });

        } catch (exception) {
            next(exception);
        }
    }
    resendToken = async (req, res, next) => {
        try {
            const token = req.params.token;
            let userModel = await createUserModel(sequelize);
            const userDetails = await authSvc.getSingleUserByFilter(userModel, { activationtoken: token });

            const activationToken = randomStringGenerator(100)
            //willl be useful in reschedule and cancellation
            const activeFor = new Date(Date.now() + (60 * 60 * 3 * 1000))

            await authSvc.updateUserById(userModel, { user_id: userDetails.user_id }, { activationtoken: activationToken, activefor: activeFor })

            myEvent.emit(EventName.SIGNUP_EMAIL, { name: userDetails.firstname, email: userDetails.email, token: activationToken });

            res.json({
                result: {
                    activationToken,
                    activeFor
                },
                message: "An email has been delivered for reactivation token.",
                meta: null,
                status: "ACTIVATION_TOKEN_RESEND_SUCCESS"
            })

        } catch (exception) {
            next(exception);
        }

    }

    signIn = (req, res, next) => {

    }



    getUser = (req, res, next) => {

    }

    logout = (req, res, next) => {

    }
    forgotPassword = (req, res, next) => {

    }

    resetPassword = (req, res, next) => {

    }
}
const authCtrl = new AuthController()
module.exports = authCtrl;