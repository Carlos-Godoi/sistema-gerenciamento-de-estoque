import { Router } from 'express';
import {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier
} from '../controllers/supplier.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Acesso de escrita (Criação/Atualização): Admin e Inventory
const InventoryOrAdmin = [UserRole.Admin, UserRole.Inventory];

// Rota de Criação
router.post('/',
    protect,
    authorize(InventoryOrAdmin),
    createSupplier
);

// Rota de Listagem (Basta estar logado para listar)
router.get('/',
    protect,
    getSuppliers 
);

// Rota de Atualização
router.put('/:id',
    protect,
    authorize(InventoryOrAdmin),
    updateSupplier
);

// Rota de Deleção (Apenas Admin)
router.delete('/:id',
    protect,
    authorize([UserRole.Admin]), // Restrição mais alta para exclusão
    deleteSupplier
);

export default router;