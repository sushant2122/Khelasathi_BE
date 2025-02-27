
const { fileDelete } = require("../../utilities/helper")
const { myEvent, EventName } = require("../../middleware/events.middleware")
const { authSvc } = require("../auth/auth.service");
const { sequelize } = require("../../config/db.config");
const { createUserModel } = require("../user/user.model");
const { randomStringGenerator } = require("../../utilities/helper");
const { Status } = require("../../config/constants.config");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
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
                myEvent.emit(EventName.SIGNUP_EMAIL, { name: data.full_name, email: data.email, token: data.activationtoken });

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

            const updateBody = {
                activationtoken: null,
                activefor: null,
                is_verified: Status.ACTIVE
            }

            await authSvc.updateUserById(userModel, { user_id: userDetails.user_id }, updateBody)
            myEvent.emit(EventName.ACTIVATION_EMAIL, { name: userDetails.full_name, email: userDetails.email });


            // Further logic to activate user...
            res.json({
                message: "User activated successfully",
                status: "SUCCESS",
                meta: null
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
            const activeFor = new Date(Date.now() + (60 * 60 * 1 * 1000))

            await authSvc.updateUserById(userModel, { user_id: userDetails.user_id }, { activationtoken: activationToken, activefor: activeFor })

            myEvent.emit(EventName.SIGNUP_EMAIL, { name: userDetails.full_name, email: userDetails.email, token: activationToken });

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

    signIn = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            let userModel = await createUserModel(sequelize);
            const user = await authSvc.getSingleUserByFilter(userModel, { email: email });
            //exists
            if (bcrypt.compareSync(password, user.password)) {
                if (user.is_verified !== Status.ACTIVE) {
                    throw { code: 400, message: "Your account has not been activated.", status: "USER_NOT_ACTIVE" }
                } else {
                    const accessToken = jwt.sign({
                        sub: user.user_id,
                        type: "access"
                    }, process.env.JWT_SECRET, {
                        expiresIn: "1 hour"
                    })

                    const refreshToken = jwt.sign({
                        sub: user.user_id,
                        type: "refresh"
                    }, process.env.JWT_SECRET, {
                        expiresIn: "1 day"
                    })
                    res.json({
                        token: {
                            access: accessToken,
                            refresh: refreshToken
                        },
                        detail: {
                            _id: user.user_id,
                            name: user.full_name,
                            email: user.email,
                            role: user.role_title
                        },
                        message: "Welcome to " + user.role_title + "pannel.",
                        meta: null,
                        status: "LOGIN_SUCCESS"
                    })
                }


            } else {
                throw { code: 400, message: "Credential doesnot match", status: "CREDENTIAL_FAILED" }
            }

        } catch (exception) {
            next(exception);

        }


    }

    getUser = (req, res, next) => {

        res.json({
            result: req.authUser,
            message: "Logged in user details",
            meta: null,
            status: "LOGGED_IN_USER"
        })

    }

    forgotPassword = async (req, res, next) => {
        try {

            const { email } = req.body;
            const resettoken = randomStringGenerator(100)
            const reset_activefor = new Date(Date.now() + (60 * 60 * 3 * 1000))
            let userModel = await createUserModel(sequelize);
            const user = await authSvc.getSingleUserByFilter(userModel, { email: email });
            await authSvc.updateUserById(userModel, { user_id: user.user_id }, { resettoken: resettoken, reset_activefor: reset_activefor })
            myEvent.emit(EventName.FORGET_PASSWORD, { name: user.full_name, email: email, token: resettoken });
            res.json({
                result: {
                    resettoken,
                    reset_activefor
                },
                message: "An email has been delivered for password reset token.",
                meta: null,
                status: "RESET_PASSWORD_TOKEN_SEND"
            })

        } catch (exception) {
            next(exception)
        }

    }

    resetPassword = async (req, res, next) => {
        try {
            const resettoken = req.params.token;
            let userModel = await createUserModel(sequelize);
            const user = await authSvc.getSingleUserByFilter(userModel, { resettoken: resettoken });

            const { password } = req.body;

            const hashedPassword = bcrypt.hashSync(password, 10);

            let tokenExpiry = new Date(user.reset_activefor);
            const today = new Date();

            if (tokenExpiry < today) {
                throw ({ code: 400, message: "Token already expired.", status: "ACTIVATION_TOKEN_EXPIRED" });
            }


            await authSvc.updateUserById(userModel, { user_id: user.user_id }, { password: hashedPassword, resettoken: null, reset_activefor: null })

            myEvent.emit(EventName.SIGNUP_EMAIL, { name: user.full_name, email: user.email });


            res.json({
                message: "Password reset successfully.",
                status: "SUCCESS",
                meta: null
            });


        } catch (exception) {
            next(exception);
        }
    }

    changePassword = async (req, res, next) => {
        try {
            const { current_password, password } = req.body;

            const hashedPassword = bcrypt.hashSync(password, 10);
            const userDetails = req.authUser;
            let userModel = await createUserModel(sequelize);
            const user = await authSvc.getSingleUserByFilter(userModel, { user_id: userDetails.user_id });
            if (bcrypt.compareSync(current_password, user.password)) {
                await authSvc.updateUserById(userModel, { user_id: user.user_id }, { password: hashedPassword })
                res.json({
                    message: "Password changed successfully.",
                    status: "SUCCESS",
                    meta: null
                });
            } else {
                throw ({ code: 400, message: "Current Password didn't match.", status: "PASSWORD_UNMATCHED" });
            }

        } catch (exception) {
            next(exception)
        }
    }
    //logout left 
    logout = (req, res, next) => {

    }
}
const authCtrl = new AuthController()
module.exports = authCtrl;