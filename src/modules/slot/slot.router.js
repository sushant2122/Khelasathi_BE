const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");

const { createSlotDTO, updateSlotDTO } = require("./slot.contract");
const slotCtrl = require("./slot.controller");

const slotRouter = require("express").Router();

slotRouter.get('/list-home', slotCtrl.listForHome)

slotRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), slotCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(createSlotDTO), slotCtrl.store)
slotRouter.route("/:id")
    .get(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), slotCtrl.show)
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(updateSlotDTO), slotCtrl.update)
    .delete(loginCheck, checkAccess(['Admin', 'Venue']), slotCtrl.remove)

module.exports = slotRouter;