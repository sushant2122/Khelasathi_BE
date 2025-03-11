const Joi = require("joi");
const createFutsalImageDTO = Joi.object({
    caption: Joi.string().min(5).max(50).required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(true),
    image: Joi.string()

});

const updateFutsalImageDTO = Joi.object({
    caption: Joi.string().min(5).max(50).required(),
    is_active: Joi.string().regex(/^(true|false)$/).default(true),
    image: Joi.string()
});

module.exports = {
    createFutsalImageDTO,
    updateFutsalImageDTO
}