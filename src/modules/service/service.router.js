const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { serviceCreateDTO, serviceUpdateDTO } = require("./service.contract");
const serviceCtrl = require("./service.controller");

const serviceRouter = require("express").Router();

serviceRouter.get('/list-venue', serviceCtrl.listForVenue)

serviceRouter.route('/')
    .get(loginCheck, checkAccess('Admin'), serviceCtrl.index)
    .post(loginCheck, checkAccess('Admin'), bodyValidator(serviceCreateDTO), serviceCtrl.store)
serviceRouter.route("/:id")

    .put(loginCheck, checkAccess('Admin'), bodyValidator(serviceUpdateDTO), serviceCtrl.update)
    .delete(loginCheck, checkAccess('Admin'), serviceCtrl.remove)

module.exports = serviceRouter;