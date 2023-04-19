import { MongoClient } from "mongodb";
import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import Joi from "joi";
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 5000


const mongoClient = new MongoClient(process.env.MONGO_URI)
try {
    await mongoClient.connect()

    console.log("mongoDB connected!")
} catch(err){
    console.log(err)
}
const db = mongoClient.db()

const schemaSignUp = Joi.object({
    name: Joi.string().required().min(1),

    email: Joi.string().email().required().min(1),

    password: Joi.string().min(3).required(),

})

const schemaLogin = Joi.object({
    email: Joi.string().email().required().min(1),
    password: Joi.string().min(3).required()
})

const schemaTransacao = Joi.object({
    valor: Joi.number().positive().required(),
    descricao: Joi.string().required()
})

const alt = Joi.alternatives().try("entrada","saida")
const validToken = Joi.string().length(36)

app.post("/",async (req,res)=> {

    const {error} = schemaLogin.validate(req.body)

    if(error !== undefined){
        return res.status(422).send(error.details[0].message)
    }

    const {email, password} = req.body

    try{
        const [user] = await db.collection("users").find({email}).toArray()

        if(user === undefined) return res.status(404).send("Email não cadastrado")

        if(!bcrypt.compareSync(password, user.password)) return res.status(401).send("senha incorreta")
        
        const token = uuid()

        await db.collection("sessions").insertOne({token: token, userId: user._id})
        
        return res.status(200).send(token)
        
    } catch(err){
        return res.status(500).send(err)
    }



    
})

app.post("/cadastro",async (req,res)=>{

    
    const {error} = schemaSignUp.validate(req.body)

    if(error !== undefined){
        return res.status(422).send(error.details[0].message)
    }

    try{

        const user = await db.collection("users").find({email: req.body.email}).toArray()

        if(user.length !== 0){
            return res.status(409).send("o email já está sendo utilizado")
        }

        const {name,email} = req.body
        const password = bcrypt.hashSync(req.body.password,10)

        await db.collection("users").insertOne({name,email,password})

        return res.status(201).send("ok")

    } catch(err){
        return res.status(500).send(err)
    }
    

    

})

app.post("/nova-transacao/:tipo",async (req,res)=>{

    const { token } = req.headers
    const { tipo } = req.params


    if(token === undefined){
        return res.status(401).send("Token missing")
    }

    if(alt.validate(tipo).error){
        return res.status(422).send(alt.validate(tipo).error.details[0].message)
    }

    if(validToken.validate(token).error){

        return res.status(422).send(validToken.validate(token).error.details[0].message)
    }

    if(schemaTransacao.validate(req.body).error){
        console.log(schemaTransacao.validate(req.body).error)

        return res.status(422).send(schemaTransacao.validate(req.body).error.details[0].message)
    }


    try{
        //verificar se existe usuario com o token
        const [user] = await db.collection("sessions").find({token}).toArray()

        if(user === undefined) return res.status(422).send("Token inválido")

        await db.collection("transacoes").insertOne({userId: user.userId, tipo, valor: req.body.valor, descricao: req.body.descricao })

        return res.send("ok")

    } catch(err){
        return res.status(500).send("ok")
    }
    

    
    
 })


 app.get("/transacoes",async (req,res)=>{

    const { token } = req.headers

    if(token === undefined){
        return res.status(401).send("Token missing")
    }

    if(validToken.validate(token).error){

        return res.status(422).send(validToken.validate(token).error.details[0].message)
    }

    try{

        const [user] = await db.collection("sessions").find({token}).toArray()

        if(user === undefined) return res.status(401).send("Token inválido")

        const transacoes = await db.collection("transacoes").find({userId: user.userId}).toArray()

        return res.status(200).send(transacoes)
    } catch(err){
        
        return res.status(500).send(err)
    }

 })

app.listen(process.env.PORT, ()=>{console.log(`rodando na porta ${process.env.PORT}`)})
