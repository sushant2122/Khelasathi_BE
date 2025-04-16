const Joi = require("joi");

const contactDTO = Joi.object({
    subject: Joi.string().min(2).max(50).required(),
    message: Joi.string().min(4).max(250).required(),
    email: Joi.string().email().required(), //for only accepting gmail pass tlds:{ ["gmail.com"]}

});

module.exports = { contactDTO }