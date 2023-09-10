// const Joi = require('joi');
// const { number } = require('joi'); //we are requiring the whole joi library and then we are destructuring the number property from it, so we can use it in our schema

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.catSchema = Joi.object({
    cat: Joi.object({
        title: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        color: Joi.string().required(),
        fluffy: Joi.boolean().optional(),
        friendliness: Joi.number().required().min(1).max(10),
    }).required(),
    deleteImages: Joi.array() //this is an array of strings
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().optional().allow('').escapeHTML(),
        rating: Joi.number().required().min(1).max(10),
        image: Joi.object({
            url: Joi.string().escapeHTML(),
            filename: Joi.string().escapeHTML()
        }).optional()
    })
});