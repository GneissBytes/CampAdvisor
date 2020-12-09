const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html')


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not inculde HTML'
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
})

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().escapeHTML().required(),
        isAdmin: Joi.boolean(),
        canAddCampground: Joi.boolean(),
        canAddReview: Joi.boolean(),
        location: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        images: Joi.array(),
        description: Joi.string().escapeHTML().required(),
        geometry: Joi.object({
            type: Joi.string(),
            coordinates: Joi.array()
        })
    }).required(),
    deleteImages: Joi.array()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().escapeHTML().required()
    }).required()
})