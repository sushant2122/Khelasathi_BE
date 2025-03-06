const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { futsalMerchantCreateDTO, futsalMerchantUpdateDTO } = require("./futsal_merchant.contract");
const merchantCtrl = require("./futsal_merchant.controller");

const futsalMerchantRouter = require("express").Router();

futsalMerchantRouter.get('/show-home/:id', loginCheck, checkAccess('Player'), merchantCtrl.showForHome)

futsalMerchantRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), merchantCtrl.index)
    .post(loginCheck, checkAccess('Venue'), bodyValidator(futsalMerchantCreateDTO), merchantCtrl.store)
futsalMerchantRouter.route("/:id")
    .put(loginCheck, checkAccess('Venue'), bodyValidator(futsalMerchantUpdateDTO), merchantCtrl.update) //this will work for approving 
    .delete(loginCheck, checkAccess('Venue'), merchantCtrl.remove)

module.exports = futsalMerchantRouter;