const Joi = require("joi");

const createClosingDTO = Joi.object({
    court_id: Joi.number().integer().required(),
    date: Joi.date().required(),  // Ensure date is provided
    reason: Joi.string().max(255).required() // Reason is required and limited to 255 characters
});


module.exports = {
    createClosingDTO,
};
