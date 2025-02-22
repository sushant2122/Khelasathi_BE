const { cloudinary } = require("../../config/cloudinary.config")
const { uploadHelper } = require("../../utilities/helper")

class AuthController {
    signUp = async (req, res, next) => {

        try {

            const data = req.body
            const uploadFile = await uploadHelper(req.file)
            console.log(uploadFile)
        }
        catch (exception) {


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