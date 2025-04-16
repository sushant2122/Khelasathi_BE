const { loginCheck } = require("../../middleware/auth.middleware");

const { transactionCtrl } = require("./transaction.controller");


const transactionRouter = require("express").Router();

transactionRouter.post('/callbackkhalti', transactionCtrl.addTransaction)

transactionRouter.get('/', transactionCtrl.index)

transactionRouter.get('/user-transaction', loginCheck, transactionCtrl.getUserTransactions)

module.exports = transactionRouter;