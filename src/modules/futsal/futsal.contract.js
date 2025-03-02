const Joi = require("joi");


const futsalCreateDTO = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(100).required(),
    location: Joi.string().min(3).max(50).required(),
    maplink: Joi.string().required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
    contact_number: Joi.string().min(9).max(10).required(),
    citizenship_front_url: Joi.string().optional(),
    citizenship_back_url: Joi.string().optional(),
    pan_number: Joi.string().min(3).max(50).required(),
    verification_status: Joi.string().regex(/^(pending|approved|rejected)$/).default('pending')

});

const futsalUpdateDTO = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(100).required(),
    location: Joi.string().min(3).max(50).required(),
    maplink: Joi.string().uri().default(null),
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
    contact_number: Joi.string().min(9).max(10).required(),
    verification_status: Joi.string().regex(/^(pending|approved|rejected)$/).default('pending')


});

const futsalVerifyDTO = Joi.object({
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
    verification_status: Joi.string().regex(/^(pending|approved|rejected)$/).default('pending')

});


module.exports = { futsalCreateDTO, futsalUpdateDTO, futsalVerifyDTO }