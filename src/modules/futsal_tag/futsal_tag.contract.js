const Joi = require("joi");


const addTagDTO = Joi.object({
    TagTagId: Joi.string().required()
});


module.exports = { addTagDTO };