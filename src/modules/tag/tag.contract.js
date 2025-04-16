const Joi = require("joi");


const tagCreateDTO = Joi.object({
    tagname: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(5).max(250),
    is_available: Joi.boolean().default(true)
});

const tagUpdateDTO = Joi.object({
    tagname: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(5).max(250),
    is_available: Joi.boolean().default(true)
});

module.exports = { tagCreateDTO, tagUpdateDTO }