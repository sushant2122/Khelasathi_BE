
const { fileDelete } = require("../../utilities/helper")
const { myEvent, EventName } = require("../../middleware/events.middleware")
const { authSvc } = require("../auth/auth.service");
const { randomStringGenerator } = require("../../utilities/helper");
const { Status } = require("../../config/constants.config");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
class AuthController {
    /**
*  this function is used to signup the user detail
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    signUp = async (req, res, next) => {
        try {
            // Transform user details (including file upload if present)
            const data = await authSvc.transformUserDetails(req);


            // Create the user and handle the result
            const userCreationResult = await authSvc.createUser(data, next);

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

        } finally {
            if (req.file) {
                fileDelete(req.file.path);
            }
        }
    };
    /**
*  this function is used to activate the user by verifying token
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    activateUser = async (req, res, next) => {
        try {
            const token = req.params.token;

            console.log(token);

            const userDetails = await authSvc.getSingleUserByFilter({ activationtoken: token });

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

            await authSvc.updateUserById({ user_id: userDetails.user_id }, updateBody)
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
    /**
*  this function is used to resend the verification if expired
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    resendToken = async (req, res, next) => {
        try {
            const token = req.params.token;

            const userDetails = await authSvc.getSingleUserByFilter({ activationtoken: token });

            const activationToken = randomStringGenerator(100)
            //willl be useful in reschedule and cancellation
            const activeFor = new Date(Date.now() + (60 * 60 * 1 * 1000))

            await authSvc.updateUserById({ user_id: userDetails.user_id }, { activationtoken: activationToken, activefor: activeFor })

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
    /**
*  this function is used to login the user
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    signIn = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const filter = { email: email };

            const user = await authSvc.getSingleUserByFilter(filter);
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
    /**
*  this function is used to get the user details 
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    getUser = (req, res, next) => {

        res.json({
            result: req.authUser,
            message: "Logged in user details",
            meta: null,
            status: "LOGGED_IN_USER"
        })

    }
    /**
*  this function is used to get send the mail if password is forgotten 
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    forgotPassword = async (req, res, next) => {
        try {

            const { email } = req.body;
            const resettoken = randomStringGenerator(100)
            const reset_activefor = new Date(Date.now() + (60 * 60 * 3 * 1000))

            const user = await authSvc.getSingleUserByFilter({ email: email });
            await authSvc.updateUserById({ user_id: user.user_id }, { resettoken: resettoken, reset_activefor: reset_activefor })
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
    /**
*  this function is used to reset the password after successful token verification
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    resetPassword = async (req, res, next) => {
        try {
            const resettoken = req.params.token;

            const user = await authSvc.getSingleUserByFilter({ resettoken: resettoken });

            const { password } = req.body;

            const hashedPassword = bcrypt.hashSync(password, 10);

            let tokenExpiry = new Date(user.reset_activefor);
            const today = new Date();

            if (tokenExpiry < today) {
                throw ({ code: 400, message: "Token already expired.", status: "ACTIVATION_TOKEN_EXPIRED" });
            }


            await authSvc.updateUserById({ user_id: user.user_id }, { password: hashedPassword, resettoken: null, reset_activefor: null })

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
    /**
*  this function is used to change the password by entering the current password
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    changePassword = async (req, res, next) => {
        try {
            const { current_password, password } = req.body;

            const hashedPassword = bcrypt.hashSync(password, 10);
            const userDetails = req.authUser;

            const user = await authSvc.getSingleUserByFilter({ user_id: userDetails.user_id });
            if (bcrypt.compareSync(current_password, user.password)) {
                await authSvc.updateUserById({ user_id: user.user_id }, { password: hashedPassword })
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

    /**
*  this function is used to update the user profile
* @param {import ("express").Request} req 
*  * @param {import ("express").Response} res
*  * @param {import ("express").NextFunction} next
* @return {void} 
 
*/
    update = async (req, res, next) => {
        try {
            // Transform user details (including file upload if present)
            const data = await authSvc.transformUpdateUserDetails(req);

            const userId = req.authUser.user_id;
            const filter = { user_id: userId };

            // Create the user and handle the result
            const updateddetails = await authSvc.updateUserById(filter, data);
            res.json({
                message: "Profile updated successfully.",
                result: updateddetails,
                status: "SUCCESS",
                meta: null
            });

        } catch (exception) {
            // Handle any unexpected errors during the process
            console.error(exception);

        } finally {
            if (req.file) {
                fileDelete(req.file.path);
            }
        }
    };
}
const authCtrl = new AuthController()
module.exports = authCtrl;