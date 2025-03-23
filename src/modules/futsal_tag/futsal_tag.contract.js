const Joi = require("joi");


const addTagDTO = Joi.object({
    tag_id: Joi.string().required()
});


module.exports = { addTagDTO };