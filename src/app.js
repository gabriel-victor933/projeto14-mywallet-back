import { MongoClient } from "mongodb";
import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import Joi from "joi";

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 5000


const mongoClient = new MongoClient(process.env.DATABASE_URI)
try {
    await mongoClient.connect()

    console.log("mongoDB connected!")
} catch(err){
    console.log(err)
}
const db = mongoClient.db()

const schemaSignUp = Joi.object({
    name: Joi.string().required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(3).required(),

    confirmPassword: Joi.ref('password')

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

        await db.collection("users").insertOne(req.body)

        return res.status(201).send("ok")

    } catch(err){
        return res.status(500).send(err)
    }
    

    

})

app.listen(PORT, ()=>{console.log(`rodando na porta ${PORT}`)})
