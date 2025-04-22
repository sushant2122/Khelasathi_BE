const Joi = require("joi");

const futsalCreateDTO = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).required(),
    location: Joi.string().min(3).max(50).required(),
    maplink: Joi.string().required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
    contact_number: Joi.string().min(9).max(10).required(),
    citizenship_front_url: Joi.string().optional(),
    citizenship_back_url: Joi.string().optional(),
    pan_number: Joi.string().min(3).max(50).required(),
    verification_status: Joi.string().regex(/^(pending|approved|rejected)$/).default('pending'),
    image_url: Joi.string().optional(),

});

const futsalUpdateDTO = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().min(10),
    location: Joi.string().min(3).max(50),
    maplink: Joi.string().default(null),
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
    contact_number: Joi.string().min(9).max(10),
    image_url: Joi.string().optional(),
    citizenship_front_url: Joi.string().optional(),
    citizenship_back_url: Joi.string().optional(),
    pan_number: Joi.string().min(3).max(50),
});

const futsalVerifyDTO = Joi.object({
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
    verification_status: Joi.string().regex(/^(pending|approved|rejected)$/).default('pending')

});

module.exports = { futsalCreateDTO, futsalUpdateDTO, futsalVerifyDTO }