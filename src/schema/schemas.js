import Joi from "joi";

export const schemaId = Joi.string().alphanum().length(24)
export const alt = Joi.alternatives().try("entrada","saida")