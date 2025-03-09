const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { futsalMerchantCreateDTO, futsalMerchantUpdateDTO } = require("./futsal_merchant.contract");
const merchantCtrl = require("./futsal_merchant.controller");

const futsalMerchantRouter = require("express").Router();

futsalMerchantRouter.get('/show-home/:id', loginCheck, checkAccess(['Player', 'Venue']), merchantCtrl.showForHome) //for extracting the client id and secret key in payment process by player
futsalMerchantRouter.get('/list-home/', loginCheck, checkAccess(['Player', 'Venue']), merchantCtrl.listHome)
futsalMerchantRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), merchantCtrl.index) //for view thing details of merchant details for both admin and user 
    .post(loginCheck, checkAccess('Venue'), checkFutsalRegistered(), bodyValidator(futsalMerchantCreateDTO), merchantCtrl.store) //to add merchant it by venue
futsalMerchantRouter.route("/:id")
    .put(loginCheck, checkAccess('Venue'), bodyValidator(futsalMerchantUpdateDTO), merchantCtrl.update) //to update by venue
    .delete(loginCheck, checkAccess('Venue'), merchantCtrl.remove) //to delete by venue 

module.exports = futsalMerchantRouter;