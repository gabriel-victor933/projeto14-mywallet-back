import Joi from "joi";

export const schemaLogin = Joi.object({
    email: Joi.string().email().required().min(1),
    password: Joi.string().min(3).required()
})