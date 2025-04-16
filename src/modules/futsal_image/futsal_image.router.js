const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { createFutsalImageDTO, updateFutsalImageDTO } = require("./futsal_image.contract");
const { futsalImgCtrl } = require("./futsal_image.controller");
const { setPath, uploader } = require("../../middleware/uploader.middleware");
const futsalImageRouter = require("express").Router();
futsalImageRouter.get('/show-home/:id', futsalImgCtrl.showForHome) //for extracting the 

futsalImageRouter.route('/')
    .get(loginCheck, checkAccess(['Admin', 'Venue']), checkFutsalRegistered(), futsalImgCtrl.index)
    .post(loginCheck, checkAccess(['Admin', 'Venue']), setPath('Futsal-Img/'), uploader.single("image"), checkFutsalRegistered(), bodyValidator(createFutsalImageDTO), futsalImgCtrl.store)
futsalImageRouter.route("/:id")
    .get(loginCheck, checkAccess(['Admin', 'Venue', 'Player']), futsalImgCtrl.show) //user needs to be logged in to see the credit point required to book a futsal for one hour
    .put(loginCheck, checkAccess(['Admin', 'Venue']), setPath('Futsal-Img/'), uploader.single("image"), bodyValidator(updateFutsalImageDTO), futsalImgCtrl.update)
    .delete(loginCheck, checkAccess(['Admin', 'Venue']), futsalImgCtrl.remove)

module.exports = futsalImageRouter;