const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");

const { addTagDTO } = require("./futsal_tag.contract");
const futsalTagCtrl = require("./futsal_tag.controller");

const futsalTagRouter = require("express").Router();

futsalTagRouter.get('/show-home/:id', futsalTagCtrl.showForHome)

futsalTagRouter.route('/')
    .get(loginCheck, checkAccess('Venue'), checkFutsalRegistered(), futsalTagCtrl.index)
    .post(loginCheck, checkAccess('Venue'), checkFutsalRegistered(), bodyValidator(addTagDTO), futsalTagCtrl.store) //to add merchant it by venue
futsalTagRouter.route("/:id")
    .delete(loginCheck, checkAccess('Venue'), checkFutsalRegistered(), futsalTagCtrl.remove) //to delete by venue 

module.exports = futsalTagRouter;