const Joi = require("joi");


const signUpDTO = Joi.object({
    full_name: Joi.string().min(2).max(50).required(),
    address: Joi.string().min(4).max(50).required(),
    email: Joi.string().email().required(), //for only accepting gmail pass tlds:{ ["gmail.com"]}
    password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).messages({
        "string.pattern.base": "password must have atleast 8 digit with on capital letter special character and number"
    }),
    confirmpassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "password and confirm password does not match"
    }),
    role_title: Joi.string().regex(/^(Admin|Venue|Player)$/).required(),
    contact_number: Joi.string().min(10).max(10).required(),
    profile_img: Joi.string()
});

const forgotPasswordDTO = Joi.object({
    password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).messages({
        "string.pattern.base": "password must have atleast 8 digit with on capital letter special character and number"
    }),
    confirmpassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "password and confirm password does not match"
    }),

});

const changePasswordDTO = Joi.object({
    current_password: Joi.string().required(),

    password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).messages({
        "string.pattern.base": "password must have atleast 8 digit with on capital letter special character and number"
    }),
    confirmpassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "password and confirm password does not match"
    }),

});

const resetDTO = Joi.object({
    email: Joi.string().email().required()
});






module.exports = { signUpDTO, forgotPasswordDTO, changePasswordDTO, resetDTO }