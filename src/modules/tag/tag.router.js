const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { tagCreateDTO, tagUpdateDTO } = require("./tag.contract");
const tagCtrl = require("./tag.controller");

const tagRouter = require("express").Router();

tagRouter.get('/list-venue', tagCtrl.listForVenue)

tagRouter.route('/')
    .get(loginCheck, checkAccess('Admin'), tagCtrl.index)
    .post(loginCheck, checkAccess('Admin'), bodyValidator(tagCreateDTO), tagCtrl.store)
tagRouter.route("/:id")

    .put(loginCheck, checkAccess('Admin'), bodyValidator(tagUpdateDTO), tagCtrl.update)
    .delete(loginCheck, checkAccess('Admin'), tagCtrl.remove)

module.exports = tagRouter;