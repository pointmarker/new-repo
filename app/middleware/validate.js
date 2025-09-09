let joi = require('joi').extend(require('@joi/date'))
joi.objectId = require('joi-objectid')(joi)

const {ValidationError} = require('../services/error.service')

const newTaskSchema = joi.object({
        title: joi.string().min(1).max(100).required(),
        description: joi.string().min(1),
        completed: joi.boolean().default(false).required()
        // createdAt: joiDate.date().format('YYYY-MM-DD').required()
})
const updateTaskSchema =joi.object({
        title: joi.string().min(1).max(100).required(),
        description: joi.string().min(1).max(10000).required(),
        completed: joi.boolean().required()
    })
const idSchema = joi.object({
        id: joi.objectId().required()
    })

const validateRequest = (schema, property = 'body') => {
    return(req,res,next) => {
        const {error, value} = schema.validate(req[property],{
            abortEarly: false,
            stripUnknown: true,
            errors: {
                wrap: {
                    label: false
                }
            }
        })

        if(error){
            const errorDetails = error.details.map(detail => ({
                path: detail.path.join('.'),
                message: detail.message
            }));

            return  next(new ValidationError("cant validate","validate.js",errorDetails))
        }
        req[property] = value
        next()
    }
}

module.exports = {
    validateRequest,
    newTaskSchema,
    updateTaskSchema,
    idSchema
}