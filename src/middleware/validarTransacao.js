import { schemaTransacao } from "../schema/schemaTransacao.js";

export default async function validarTransacao(req, res, next) {

    if (schemaTransacao.validate(req.body).error) {

        const errors = schemaTransacao.validate(req.body,{abortEarly: false}).error.details.map((e)=> e.message)
        return res.status(422).send(errors)

    }

    next();
}