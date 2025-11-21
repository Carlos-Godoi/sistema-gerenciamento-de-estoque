import { Router } from 'express';
import { recordSale, getSales } from '../controllers/sale.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Rota para registrar uma nova venda
router.post('/',
    protect,
    authorize([UserRole.Admin, UserRole.Sales]),
);

// Rota para listar vendas
router.get('/',
    protect,
    authorize([UserRole.Admin, UserRole.Sales]),
);

export default router; 