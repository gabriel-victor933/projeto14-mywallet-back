import {db} from "../app.js"
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid"
import {schemaLogin} from "../schema/schemaLogin.js"
import {schemaSignUp} from "../schema/schemaSignUp.js"



export async function signIn(req,res){

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
        
        return res.status(200).send({token,name: user.name})
        
    } catch(err){
        return res.status(500).send(err)
    }

}

export async function signUp(req,res){

    
    const {error} = schemaSignUp.validate(req.body)

    if(error !== undefined){
        return res.status(422).send(error.details[0].message)
    }


    try{

        const user = await db.collection("users").find({email: req.body.email}).toArray()
        if(user.length !== 0){
            return res.status(409).send("the email is already being used")
        }

        const {name,email} = req.body
        const password = bcrypt.hashSync(req.body.password,10)

        await db.collection("users").insertOne({name,email,password})

        return res.status(201).send("ok")

    } catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
    

    

}