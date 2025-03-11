const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { creditSettingCreateDTO, creditSettingUpdateDTO } = require("./credit_setting.contract");
const { creditSettingCtrl } = require("./credit_setting.controller");

const creditSettingRouter = require("express").Router();

creditSettingRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), checkFutsalRegistered(), creditSettingCtrl.showForVenue)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), checkFutsalRegistered(), bodyValidator(creditSettingCreateDTO), creditSettingCtrl.store)
creditSettingRouter.route("/:id")
    .get(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), creditSettingCtrl.show) //user needs to be logged in to see the credit point required to book a futsal for one hour
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(creditSettingUpdateDTO), creditSettingCtrl.update)

module.exports = creditSettingRouter;