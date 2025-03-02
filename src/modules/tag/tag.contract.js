const Joi = require("joi");


const tagCreateDTO = Joi.object({
    tagname: Joi.string().min(3).max(50).required(),
    is_available: Joi.string().regex(/^(true|false)$/).default(true)
});

const tagUpdateDTO = Joi.object({
    tagname: Joi.string().min(3).max(50).required(),
    is_available: Joi.string().regex(/^(true|false)$/).default(true)
});

module.exports = { tagCreateDTO, tagUpdateDTO }