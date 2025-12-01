import { Router } from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Middleware de autorização para todas as rotas (Apenas Admin pode gerenciar usuários)
router.use(protect);
router.use(authorize([UserRole.Admin]));

// Rotas de Usuário
router.route('/')
    .get(getUsers)  // GET /api/users
    .post(createUser); // POST /api/users

router.route('/:id')
    .get(getUserById) // GET /api/users/:id
    .put(updateUser) // PUT /api/users/:id
    .delete(deleteUser) // DELETE /api/users/:id

export default router;