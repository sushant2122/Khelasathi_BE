const { loginCheck } = require("../../middleware/auth.middleware");
const { creditpointCtrl } = require("./credit_point.controller");

const CreditPointRouter = require("express").Router();

CreditPointRouter.get('/view-point', loginCheck, creditpointCtrl.calculatePoint)

CreditPointRouter.get('/list-home', loginCheck, creditpointCtrl.listForHome)

module.exports = CreditPointRouter;