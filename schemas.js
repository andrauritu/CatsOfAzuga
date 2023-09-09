const Joi = require('joi');
const { number } = require('joi'); //we are requiring the whole joi library and then we are destructuring the number property from it, so we can use it in our schema

module.exports.catSchema = Joi.object({
    cat: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        color: Joi.string().required(),
        fluffy: Joi.boolean(),
        friendliness: Joi.number().required().min(1).max(10),
    }).required(),
    deleteImages: Joi.array() //this is an array of strings
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().optional().allow(''),
        rating: Joi.number().required().min(1).max(10),
        image: Joi.object({
            url: Joi.string(),
            filename: Joi.string()
        }).optional()
    })
});