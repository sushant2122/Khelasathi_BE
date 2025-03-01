const Joi = require("joi");


const bannerCreateDTO = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    image_url: Joi.string().required(),
    link: Joi.string().uri().default(null),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});

const bannerUpdateDTO = Joi.object({
    title: Joi.string().min(3).max(50),
    image_url: Joi.string(),
    link: Joi.string().uri().default(null),
    is_active: Joi.string().regex(/^(true|false)$/)

});


module.exports = { bannerCreateDTO, bannerUpdateDTO }