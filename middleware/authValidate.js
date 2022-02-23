const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        id: Joi.string().length(7).required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        dormLocation: Joi.string().required(),
        password: Joi.string().min(6).required()
    });
   return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({
        id: Joi.string().length(7).required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data)
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
