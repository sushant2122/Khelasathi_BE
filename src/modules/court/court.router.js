const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { futsalCourtCtrl } = require("./court.controller");
const { courtCreateDTO, courtUpdateDTO } = require("./court.contract");

const CourtRouter = require("express").Router();

// Route to fetch active courts for the home page
CourtRouter.get('/show-home/:id', loginCheck, futsalCourtCtrl.showForHome);

// Routes for CRUD operations on courts
CourtRouter.route('/')
    .get(loginCheck, checkAccess('Venue'), checkFutsalRegistered(), futsalCourtCtrl.index)
    .post(loginCheck, checkAccess('Venue'), checkFutsalRegistered(), bodyValidator(courtCreateDTO), futsalCourtCtrl.store);

CourtRouter.route("/:id")
    .put(loginCheck, checkAccess('Venue'), bodyValidator(courtUpdateDTO), futsalCourtCtrl.update)
    .delete(loginCheck, checkAccess('Venue'), futsalCourtCtrl.remove);

module.exports = CourtRouter;