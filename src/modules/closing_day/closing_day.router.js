const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { createClosingDTO, updateClosingDTO } = require("./closing_day.contract");
const closingCtrl = require("./closing_day.controller");


const closingDayRouter = require("express").Router();

closingDayRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), closingCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(createClosingDTO), closingCtrl.store)
closingDayRouter.route("/:id")
    .get(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), closingCtrl.show)
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(updateClosingDTO), closingCtrl.update)
    .delete(loginCheck, checkAccess(['Admin', 'Venue']), closingCtrl.remove)

module.exports = closingDayRouter;