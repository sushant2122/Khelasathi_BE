const { loginCheck } = require("../../middleware/auth.middleware");

const { bodyValidator } = require("../../middleware/validator.middleware");

const { contactDTO } = require("./contact_us.contract");
const contactCtrl = require("./contact_us.controller");


const contactUsRouter = require("express").Router();

contactUsRouter.route('/')
    .post(loginCheck, bodyValidator(contactDTO), contactCtrl.sendmail)

module.exports = contactUsRouter;