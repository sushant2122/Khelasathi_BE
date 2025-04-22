const Joi = require("joi");

//create contract 
const bannerCreateDTO = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    image_url: Joi.string().optional(),//required(),
    link: Joi.string().uri().default(null),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});
//update contract
const bannerUpdateDTO = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    image_url: Joi.string().allow('', null).optional(),
    link: Joi.string().uri().default(null),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});

module.exports = { bannerCreateDTO, bannerUpdateDTO }