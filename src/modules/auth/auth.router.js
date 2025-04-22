const authRouter = require('express').Router();  // Create a new router instance
const authCtrl = require("./auth.controller")
const { bodyValidator } = require("../../middleware/validator.middleware")
const { signUpDTO, forgotPasswordDTO, changePasswordDTO, resetDTO, updateDTO } = require("./auth.contract")
//config for uploader 
const { setPath, uploader } = require("../../middleware/uploader.middleware");
const { loginCheck } = require('../../middleware/auth.middleware');

// Signup route
authRouter.post('/signup',
    setPath('User/'), uploader.single("profile_img"), //for uploading in local 
    bodyValidator(signUpDTO), authCtrl.signUp);

// Activate user via token
authRouter.get('/activate/:token', authCtrl.activateUser);

authRouter.get('/re-send/activation/:token', authCtrl.resendToken);

// Signin route
authRouter.post('/signin', authCtrl.signIn);


//to get loggedin users detail
authRouter.get('/me', loginCheck, authCtrl.getUser);

// authRouter.get('/admin', loginCheck, checkAccess('Player'), authCtrl.getUser);

// update route
authRouter.patch('/update', setPath('User/'), uploader.single("profile_img"), //for uploading in local 
    bodyValidator(updateDTO), loginCheck, authCtrl.update);

// Forgot password route
authRouter.post('/forget-password', bodyValidator(resetDTO), authCtrl.forgotPassword);

// Reset password route
authRouter.patch('/reset-password/:token', bodyValidator(forgotPasswordDTO), authCtrl.resetPassword);

//one more for reseting password from logged in user
authRouter.patch('/change-password', loginCheck, bodyValidator(changePasswordDTO), authCtrl.changePassword);

module.exports = authRouter;  // Correctly export the authRouter
