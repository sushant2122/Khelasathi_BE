// booking.contract.js
const Joi = require("joi");

const slotSchema = Joi.object({
    slot_id: Joi.number().integer().required(),
    price: Joi.number().precision(2).required(),
    credit_point: Joi.number().precision(2).required()

});
const bookingCreateDTO = Joi.object({
    booking_date: Joi.date().required(),
    remarks: Joi.string().max(255).optional(),
    is_paid: Joi.boolean().default(false),
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed', 'no-show').default('pending'),
    slots: Joi.array().items(slotSchema).min(1).required()
});
const bookingUpdateDTO = Joi.object({
    remarks: Joi.string().max(255).optional(),
    is_paid: Joi.boolean().default(false),
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed', 'no-show').default('pending')
});

module.exports = { bookingCreateDTO, bookingUpdateDTO };