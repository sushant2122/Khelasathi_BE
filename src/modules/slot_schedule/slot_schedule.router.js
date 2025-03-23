const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { createScheduleDTO, updateScheduleDTO } = require("./slot_schedule.contract");
const scheduleCtrl = require("./slot_schedule.controller");

const slotScheduleRouter = require("express").Router();

slotScheduleRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), scheduleCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(createScheduleDTO), scheduleCtrl.store)
slotScheduleRouter.route("/:id")
    .get(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), scheduleCtrl.show)
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(updateScheduleDTO), scheduleCtrl.update)
    .delete(loginCheck, checkAccess(['Admin', 'Venue']), scheduleCtrl.remove)

module.exports = slotScheduleRouter;