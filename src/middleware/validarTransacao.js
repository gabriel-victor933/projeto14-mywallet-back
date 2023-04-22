import { schemaTransacao } from "../schema/schemaTransacao.js";

export default async function validarTransacao(req, res, next) {

    if (schemaTransacao.validate(req.body).error) {

        return res.status(422).send(schemaTransacao.validate(req.body).error.details[0].message)
    }

    next();
}