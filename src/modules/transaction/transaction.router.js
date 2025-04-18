const { loginCheck } = require("../../middleware/auth.middleware");
const { checkFutsalRegistered } = require("../../middleware/futsalvalidation.middleware");
const { checkAccess } = require("../../middleware/rbac.middleware");

const { transactionCtrl } = require("./transaction.controller");


const transactionRouter = require("express").Router();

transactionRouter.post('/callbackkhalti', transactionCtrl.addTransaction)

transactionRouter.get('/', transactionCtrl.index)

transactionRouter.get('/user-transaction', loginCheck, transactionCtrl.getUserTransactions)

transactionRouter.get('/venue-transaction', loginCheck, checkAccess('Venue'), checkFutsalRegistered(), transactionCtrl.getFutsalTransactions)

module.exports = transactionRouter;