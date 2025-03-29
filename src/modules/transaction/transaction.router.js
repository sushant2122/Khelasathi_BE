const { loginCheck } = require("../../middleware/auth.middleware");

const { transactionCtrl } = require("./transaction.controller");


const transactionRouter = require("express").Router();

transactionRouter.get('/callbackkhalti', transactionCtrl.addTransaction)

module.exports = transactionRouter;