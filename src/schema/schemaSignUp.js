import Joi from "joi";

export const schemaSignUp = Joi.object({
    name: Joi.string().required().min(1),

    email: Joi.string().email().required().min(1),

    password: Joi.string().min(3).required(),

})