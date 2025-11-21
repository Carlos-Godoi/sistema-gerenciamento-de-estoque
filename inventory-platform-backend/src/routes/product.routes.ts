import { Router } from 'express';
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Rota de Criação
router.post('/',
    protect, // Primeiro verifica se o usuário está logado
    authorize([UserRole.Admin, UserRole.Inventory]), // Verifica se ele tem a role necessária
    createProduct
);

// Rota de Listagem (Apenas precisa estar logado)
router.get('/',
    protect, // Requer autenticação para ver o estoque
    getProducts
);

// Rota de Atualização
router.put('/:id',
    protect,
    authorize([UserRole.Admin, UserRole.Inventory]),
    updateProduct  
);

// Rota de Deleção
router.delete('/:id',
    protect,
    authorize([UserRole.Admin]), 
);

export default router;