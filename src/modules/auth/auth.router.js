const authRouter = require('express').Router();  // Create a new router instance

// Signup route
authRouter.post('/signup', (req, res) => {
    // Logic for signup
    //output
    const data = req.body
    const output = {}

    res.status(201).json({
        result: output, //output send my the logic
        message: "", //response of success or fail eg. acc successfully created
        meta: null, //null or object//to send supportive content eg. to know how many data ,pages left in pagination etc
        status: "REGISTER_SUCESS" //for knowinf the token is expired or not

    });
});
//to get loggedin users detail
authRouter.get('/me', (req, res) => {
    // Logic for token verification
});
// Activate user via token
authRouter.get('/activate/:token', (req, res) => {
    // Logic for token verification
});

// Signin route
authRouter.post('/signin', (req, res) => {
    // Logic for signin
});

// Logout route
authRouter.delete('/logout', (req, res) => {
    // Logic for logout
});

// Forgot password route
authRouter.post('/forget-password', (req, res) => {
    // Logic for forgot password
});

// Reset password route
authRouter.patch('/reset-password/:token', (req, res) => {
    // Logic for resetting password
});

module.exports = authRouter;  // Correctly export the authRouter
