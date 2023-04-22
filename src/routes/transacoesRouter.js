import {Router} from 'express';
import { novatransacao, getTransacao,deleteTransacao,editarTransacao } from '../controllers/transacoesController.js';


const router = Router()

router.post("/nova-transacao/:tipo",novatransacao)

router.get("/transacoes",getTransacao)

router.delete("/transacoes/:id",deleteTransacao)

router.put("/transacoes/:id",editarTransacao)

export default router