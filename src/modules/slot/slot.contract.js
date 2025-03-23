const Joi = require("joi");

// Joi schema for creating a slot
const createSlotDTO = Joi.object({
    court_id: Joi.number().integer().required().messages({
        "number.base": "Court ID must be a number",
        "number.integer": "Court ID must be an integer",
        "any.required": "Court ID is required"
    }),
    title: Joi.string().max(255).required().messages({
        "string.base": "Title must be a string",
        "string.max": "Title cannot exceed 255 characters",
        "any.required": "Title is required"
    }),
    start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        "string.base": "Start time must be a string",
        "string.pattern.base": "Start time must be in the format HH:MM",
        "any.required": "Start time is required"
    }),
    end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        "string.base": "End time must be a string",
        "string.pattern.base": "End time must be in the format HH:MM",
        "any.required": "End time is required"
    }),
    price: Joi.number().integer().min(0).required().messages({
        "number.base": "Price must be a number",
        "number.integer": "Price must be an integer",
        "number.min": "Price cannot be negative",
        "any.required": "Price is required"
    }),
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
});

// Joi schema for updating a slot
const updateSlotDTO = Joi.object({
    title: Joi.string().max(255).messages({
        "string.base": "Title must be a string",
        "string.max": "Title cannot exceed 255 characters"
    }),
    start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
        "string.base": "Start time must be a string",
        "string.pattern.base": "Start time must be in the format HH:MM"
    }),
    end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
        "string.base": "End time must be a string",
        "string.pattern.base": "End time must be in the format HH:MM"
    }),
    price: Joi.number().integer().min(0).messages({
        "number.base": "Price must be a number",
        "number.integer": "Price must be an integer",
        "number.min": "Price cannot be negative"
    }),
    is_active: Joi.string().regex(/^(true|false)$/).default(false),
});

module.exports = { createSlotDTO, updateSlotDTO };