import {Router} from 'express';
import { signIn,signUp } from '../controllers/userController.js';

const router = Router();

router.post("/",signIn)

router.post("/cadastro",signUp)

export default router