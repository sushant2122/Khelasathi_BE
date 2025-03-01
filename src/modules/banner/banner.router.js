const { loginCheck } = require("../../middleware/auth.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");
const { uploader, setPath } = require("../../middleware/uploader.middleware");
const { bodyValidator } = require("../../middleware/validator.middleware");
const { bannerCreateDTO, bannerUpdateDTO } = require("./banner.contract");
const bannerCtrl = require("./banner.controller");

const bannerRouter = require("express").Router();

bannerRouter.get('/list-home', bannerCtrl.listForHome)

bannerRouter.route('/')
    .get(loginCheck, checkAccess('Admin'), bannerCtrl.index)
    .post(loginCheck, checkAccess('Admin'), setPath('banners'), uploader.single('image_url'), bodyValidator(bannerCreateDTO), bannerCtrl.store)
bannerRouter.route("/:id")
    .get(loginCheck, checkAccess('Admin'), bannerCtrl.show)
    .put(loginCheck, checkAccess('Admin'), setPath('banners'), uploader.single('image_url'), bodyValidator(bannerUpdateDTO), bannerCtrl.update)
    .delete(loginCheck, checkAccess('Admin'),/**body validator */bannerCtrl.remove)

module.exports = bannerRouter;