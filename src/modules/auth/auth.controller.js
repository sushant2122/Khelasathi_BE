
const Mailsvc = require("../../services/mail.service");
const { uploadHelper, fileDelete, randomStringGenerator } = require("../../utilities/helper")
const bcrypt = require("bcryptjs");
const { myEvent, EventName } = require("../../middleware/events.middleware")

class AuthController {
    signUp = async (req, res, next) => {

        try {

            const data = req.body
            if (req.file) {
                data.image = await uploadHelper(req.file.path);
            }

            data.password = bcrypt.hashSync(data.password, 10);
            //bcrypt =>user -createdtime,ipaddress,salt,hash func

            //db operation


            data.activationtoken = randomStringGenerator(100)
            //willl be useful in reschedule and cancellation
            data.tokenExpires = new Date(Date.now() + (60 * 60 * 3 * 1000))


            myEvent.emit(EventName.SIGNUP_EMAIL, { name: data.firstname, email: data.email, token: data.activationtoken })



            res.json({
                result: data,
                meta: null,
                message: "Your account has been registered successfully.",
                status: "REGISTER_SUCESS"
            });

        }
        catch (exception) {
            if (req.file) {
                fileDelete(req.file.path);
            }
        }
    }

    signIn = (req, res, next) => {

    }

    activateUser = (req, res, next) => {

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