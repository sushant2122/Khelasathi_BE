const Joi = require("joi");


const creditSettingCreateDTO = Joi.object({
    credit_points_required_for_hour: Joi.string().max(10).required()
});

const creditSettingUpdateDTO = Joi.object({
    credit_points_required_for_hour: Joi.string().max(10).required()

});

module.exports = { creditSettingCreateDTO, creditSettingUpdateDTO };