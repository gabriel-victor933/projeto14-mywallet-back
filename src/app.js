import { MongoClient } from "mongodb";
import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import transacoesRouter from "./routes/transacoesRouter.js"
import userRouter from "./routes/userRouter.js"
import validarTransacao from "./middleware/validarTransacao.js";

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(transacoesRouter)
app.use(userRouter)
app.use(validarTransacao)

const mongoClient = new MongoClient(process.env.DATABASE_URI)
try {
    await mongoClient.connect()

    console.log("mongoDB connected!")
} catch(err){
    console.log(err)
}

export const db = mongoClient.db()

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{console.log(`rodando na porta ${PORT}`)})
