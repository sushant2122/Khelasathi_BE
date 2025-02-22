const Joi = require("joi");


const signUpDTO = Joi.object({
    firstname: Joi.string().min(2).max(50).required(),
    lastname: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(), //for only accepting gmail pass tlds:{ ["gmail.com"]}
    password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).messages({
        "string.pattern.base": "password must have atleast 8 digit with on capital letter special character and number"
    }),
    confirmpassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "password and confirm password does not match"
    }),
    role: Joi.string().regex(/^(player|admin|venue)$/),
    profileimage: Joi.string()
});

module.exports = { signUpDTO }