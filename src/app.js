import { MongoClient } from "mongodb";
import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import Joi from "joi";
import { signIn,signUp } from "./controllers/userController.js";
import { novatransacao, getTransacao, deleteTransacao, editarTransacao } from "./controllers/transacoesController.js";

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const mongoClient = new MongoClient(process.env.DATABASE_URI)
try {
    await mongoClient.connect()

    console.log("mongoDB connected!")
} catch(err){
    console.log(err)
}

export const db = mongoClient.db()

//
export const schemaSignUp = Joi.object({
    name: Joi.string().required().min(1),

    email: Joi.string().email().required().min(1),

    password: Joi.string().min(3).required(),

})

export const schemaLogin = Joi.object({
    email: Joi.string().email().required().min(1),
    password: Joi.string().min(3).required()
})

export const schemaTransacao = Joi.object({
    valor: Joi.number().positive().required(),
    descricao: Joi.string().required()
})

export const schemaId = Joi.string().alphanum().length(24)

export const alt = Joi.alternatives().try("entrada","saida")

//
app.post("/",signIn)

app.post("/cadastro",signUp)

app.post("/nova-transacao/:tipo",novatransacao)

app.get("/transacoes",getTransacao)

app.delete("/transacoes/:id",deleteTransacao)

app.put("/transacoes/:id",editarTransacao)

app.listen(process.env.PORT, ()=>{console.log(`rodando na porta ${process.env.PORT}`)})
