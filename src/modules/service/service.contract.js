const Joi = require("joi");


const serviceCreateDTO = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});

const serviceUpdateDTO = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});


module.exports = { serviceCreateDTO, serviceUpdateDTO }