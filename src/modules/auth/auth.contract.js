const Joi = require("joi");

//setting up the account 
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
//setting the password 
const forgotPasswordDTO = Joi.object({
    password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).messages({
        "string.pattern.base": "password must have atleast 8 digit with on capital letter special character and number"
    }),
    confirmpassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "password and confirm password does not match"
    }),

});
//to change the current  password 
const changePasswordDTO = Joi.object({
    current_password: Joi.string().required(),

    password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).messages({
        "string.pattern.base": "password must have atleast 8 digit with on capital letter special character and number"
    }),
    confirmpassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "password and confirm password does not match"
    }),

});
//checks email
const resetDTO = Joi.object({
    email: Joi.string().email().required()
});
//to update profile
const updateDTO = Joi.object({
    full_name: Joi.string().min(2).max(50),
    address: Joi.string().min(4).max(50),
    contact_number: Joi.string().min(10).max(10),
    profile_img: Joi.string()
});

module.exports = { signUpDTO, forgotPasswordDTO, changePasswordDTO, resetDTO, updateDTO }