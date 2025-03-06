const Joi = require("joi");

const futsalMerchantCreateDTO = Joi.object({
    service_id: Joi.required(),
    payment_client_id: Joi.string().min(3).max(50).required(),
    payment_client_secret: Joi.string().min(3).max(50).required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});

const futsalMerchantUpdateDTO = Joi.object({
    service_id: Joi.required(),
    payment_client_id: Joi.string().min(3).max(50).required(),
    payment_client_secret: Joi.string().min(3).max(50).required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(true)
});