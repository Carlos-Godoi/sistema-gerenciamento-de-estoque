import { Router } from 'express';
import { login, registerInitialUser } from '../controllers/auth.controller';

const router = Router();

// Rota de Login (Não protegida)
router.post('/login', login) ;

// Rota de Registro TEMPORÁRIA
router.post('/register', registerInitialUser); // <--- NOVO

export default router;