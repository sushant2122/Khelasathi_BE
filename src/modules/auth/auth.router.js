const authRouter = require('express').Router();  // Create a new router instance
const authCtrl = require("./auth.controller")
const { bodyValidator } = require("../../middleware/validator.middleware")
const { signUpDTO } = require("./auth.contract")
//config for uploader 
const { setPath, uploader } = require("../../middleware/uploader.middleware")

// Signup route
authRouter.post('/signup',
    setPath('User/'), uploader.single("profileimage"), //for uploading in local 
    bodyValidator(signUpDTO), authCtrl.signUp);

//to get loggedin users detail
authRouter.get('/me', authCtrl.getUser);
// Activate user via token
authRouter.get('/activate/:token', authCtrl.activateUser);

// Signin route
authRouter.post('/signin', authCtrl.signIn);

// Logout route
authRouter.delete('/logout', authCtrl.logout);

// Forgot password route
authRouter.post('/forget-password', authCtrl.forgotPassword);

// Reset password route
authRouter.patch('/reset-password/:token', authCtrl.resetPassword);

module.exports = authRouter;  // Correctly export the authRouter
