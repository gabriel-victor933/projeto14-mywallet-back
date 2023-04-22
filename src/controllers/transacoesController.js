import {db, schemaTransacao, alt,schemaId} from "../app.js"
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

export async function novatransacao(req,res){


    const { tipo } = req.params
    const token  = req.headers.authorization?.replace("Bearer","").trim()

    if(token === undefined){
        return res.status(401).send("Token missing")
    }

    if(token.length !== 36){
        return res.status(422).send("Token inválido")
    }


    if(alt.validate(tipo).error){
        return res.status(422).send(alt.validate(tipo).error.details[0].message)
    }

    
    if(schemaTransacao.validate(req.body).error){
        console.log(schemaTransacao.validate(req.body).error)

        return res.status(422).send(schemaTransacao.validate(req.body).error.details[0].message)
    }


    try{
        //verificar se existe usuario com o token
        const [user] = await db.collection("sessions").find({token}).toArray()

        if(user === undefined) return res.status(422).send("Token inválido")

        await db.collection("transacoes").insertOne({userId: user.userId, tipo, valor: req.body.valor, descricao: req.body.descricao,data: dayjs().format("DD/MM") })

        return res.send("ok")

    } catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
    
}

export async function getTransacao(req,res){

    const token  = req.headers.authorization?.replace("Bearer","").trim()

    if(token === undefined){
        return res.status(401).send("Token missing")
    }

    if(token.length !== 36){
        return res.status(422).send("Token inválido")
    }

    try{

        const [user] = await db.collection("sessions").find({token}).toArray()

        if(user === undefined) return res.status(401).send("Token inválido")

        const transacoes = await db.collection("transacoes").find({userId: user.userId}).toArray()
        return res.status(200).send(transacoes)

    } catch(err){
        
        return res.status(500).send(err)
    }

}

export async function deleteTransacao(req,res){
    const { id } = req.params
    const token  = req.headers.authorization?.replace("Bearer","").trim()
    if(token ===undefined) return res.status(401).send("missing token")

    if(schemaId.validate(id).error){
        return res.status(401).send(schemaId.validate(id).error.message.replace("value","id"))
    }

    try{
        const [user] = await db.collection("sessions").find({token}).toArray()

        if(user === undefined) return res.status(401).send("Token inválido")

        const query = {$and: [{_id: new ObjectId(id)},{userId: user.userId}]}

        const [transacao] = await db.collection("transacoes").find(query).toArray()


        if(transacao === undefined) return res.status(404).send("transacao não encontrada")

        await db.collection("transacoes").deleteOne(query)

        res.status(202).send("delete")

    } catch(err){
        res.status(500).send(err)
    }

}

export async function editarTransacao(req,res){

    

    const token  = req.headers.authorization?.replace("Bearer","").trim()
    if(token ===undefined) return res.status(401).send("missing token")

    const { id } = req.params
    if(schemaId.validate(id).error){
        return res.status(401).send(schemaId.validate(id).error.message.replace("value","id"))
    }

    if(schemaTransacao.validate(req.body).error){
        console.log(schemaTransacao.validate(req.body).error)

        return res.status(422).send(schemaTransacao.validate(req.body).error.details[0].message)
    }

    try{
        const [user] = await db.collection("sessions").find({token}).toArray()

        if(user === undefined) return res.status(401).send("Token inválido")

        const query = {$and: [{_id: new ObjectId(id)},{userId: user.userId}]}

        const [transacao] = await db.collection("transacoes").find(query).toArray()

        if(transacao === undefined) return res.status(404).send("transacao não encontrada")

        const update = {$set: {...transacao, valor: req.body.valor, descricao: req.body.descricao}}

        await db.collection("transacoes").updateOne(query,update)
        
        res.status(202).send("Update")
    } catch(err){
        return res.status(500).send("Erro do servidor")
    }
    
}