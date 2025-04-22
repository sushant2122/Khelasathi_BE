const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { uploader, setPath } = require("../../middleware/uploader.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { futsalCreateDTO, futsalUpdateDTO, futsalVerifyDTO } = require("./futsal.contract");
const futsalCtrl = require("./futsal.controller");

const futsalRouter = require("express").Router();

futsalRouter.get('/show-home/:id', loginCheck, futsalCtrl.showForHome)
futsalRouter.get('/list-futsal', futsalCtrl.listForFutsal)
futsalRouter.get('/list-home', futsalCtrl.listForHome)
//futsal detail of logged in user 
futsalRouter.get('/venue-futsal', loginCheck, checkAccess('Venue'), futsalCtrl.getFutsalDetail)
futsalRouter.put('/verify-futsal/:id', loginCheck, checkAccess('Admin'), bodyValidator(futsalVerifyDTO),
    futsalCtrl.verify)
futsalRouter.get('/registered-futsal', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), futsalCtrl.registeredFutsal)
futsalRouter.get('/futsaldetail/:id', loginCheck, checkAccess('Admin'), futsalCtrl.getAllFutsalsWithDetails)
futsalRouter.put('/updateprofile', loginCheck, checkAccess(['Admin', 'Venue']), checkFutsalRegistered(), setPath('futsals'),
    uploader.fields([
        { name: 'citizenship_front_url', maxCount: 1 },
        { name: 'citizenship_back_url', maxCount: 1 },
        { name: 'image_url', maxCount: 1 }
    ]), bodyValidator(futsalUpdateDTO), futsalCtrl.update)
futsalRouter.route('/')
    .get(loginCheck, checkAccess('Admin'), futsalCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), setPath('futsals'),
        uploader.fields([
            { name: 'citizenship_front_url', maxCount: 1 },
            { name: 'citizenship_back_url', maxCount: 1 },
            { name: 'image_url', maxCount: 1 }
        ]), bodyValidator(futsalCreateDTO), futsalCtrl.store)
futsalRouter.route("/:id")
    .get(futsalCtrl.show)

module.exports = futsalRouter;