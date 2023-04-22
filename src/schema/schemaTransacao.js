import Joi from "joi";

export const schemaTransacao = Joi.object({
    valor: Joi.number().positive().required(),
    descricao: Joi.string().required()
})