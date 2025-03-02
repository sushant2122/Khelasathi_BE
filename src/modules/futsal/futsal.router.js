const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { uploader, setPath } = require("../../middleware/uploader.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { futsalCreateDTO, futsalUpdateDTO, futsalVerifyDTO } = require("./futsal.contract");
const futsalCtrl = require("./futsal.controller");

const futsalRouter = require("express").Router();

futsalRouter.get('/show-home/:id', loginCheck, checkAccess('Player'), futsalCtrl.showForHome)
futsalRouter.get('/list-home', futsalCtrl.listForHome)
futsalRouter.put('/verify-futsal/:id', loginCheck, checkAccess('Admin'), bodyValidator(futsalVerifyDTO), futsalCtrl.verify)
futsalRouter.route('/')
    .get(loginCheck, checkAccess('Admin'), futsalCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), setPath('futsals'),
        uploader.fields([
            { name: 'citizenship_front_url', maxCount: 1 },
            { name: 'citizenship_back_url', maxCount: 1 }
        ]), bodyValidator(futsalCreateDTO), futsalCtrl.store)
futsalRouter.route("/:id")
    .get(loginCheck, checkAccess(['Admin', 'Venue']), futsalCtrl.show)
    .put(loginCheck, checkAccess(['Admin', 'Venue']), bodyValidator(futsalUpdateDTO), futsalCtrl.update) //this will work for approving the futsals by admin as well so didn't made another route
    .delete(loginCheck, checkAccess('Admin'), futsalCtrl.remove)

module.exports = futsalRouter;