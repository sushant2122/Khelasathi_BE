const Joi = require("joi");


const courtCreateDTO = Joi.object({
    type: Joi.string().regex(/^(indoor|outdoor)$/).default('indoor'),
    title: Joi.string().min(3).max(50).required(),
    booking_minimum_amount: Joi.string().required(),
    court_total_amount: Joi.string().required(),

});

const courtUpdateDTO = Joi.object({
    type: Joi.string().regex(/^(indoor|outdoor)$/).default('indoor'),
    title: Joi.string().min(3).max(50).required(),
    booking_minimum_amount: Joi.string().required(),
    court_total_amount: Joi.string().required(),


});



module.exports = { courtCreateDTO, courtUpdateDTO }