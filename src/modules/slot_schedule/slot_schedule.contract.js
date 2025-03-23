const Joi = require("joi")

const createScheduleDTO = Joi.object({
    slot_id: Joi.number().integer().required(),
    week_day: Joi.string().regex(/^(sun|mon|tue|wed|thu|fri|sat)$/).required()

})

const updateScheduleDTO = Joi.object({
    slot_id: Joi.number().integer().required(),
    week_day: Joi.string().regex(/^(sun|mon|tue|wed|thu|fri|sat)$/).required()

})

module.exports = {
    createScheduleDTO, updateScheduleDTO
}