import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

// Rota de Login (Não protegida)
router.post('/login', login) ;

export default router;