const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { tagCreateDTO, tagUpdateDTO } = require("./tag.contract");
const tagCtrl = require("./tag.controller");

const tagRouter = require("express").Router();

tagRouter.get('/list-home/:id', tagCtrl.listForHome)

tagRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), checkFutsalRegistered(), tagCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), checkFutsalRegistered(), bodyValidator(tagCreateDTO), tagCtrl.store)
tagRouter.route("/:id")

    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(tagUpdateDTO), tagCtrl.update)
    .delete(loginCheck, checkAccess(['Admin', 'Venue']), tagCtrl.remove)

module.exports = tagRouter;