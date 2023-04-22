import {Router} from 'express';
import { novatransacao, getTransacao,deleteTransacao,editarTransacao } from '../controllers/transacoesController.js';
import validarTransacao from '../middleware/validarTransacao.js';

const router = Router()

router.post("/nova-transacao/:tipo",validarTransacao,novatransacao)

router.get("/transacoes",getTransacao)

router.delete("/transacoes/:id",deleteTransacao)

router.put("/transacoes/:id",validarTransacao,editarTransacao)

export default router