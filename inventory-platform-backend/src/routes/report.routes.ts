import { Router } from 'express';
import { getLowStockReport, getSalesSummary } from '../controllers/report.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Relatório de Estoque Baixo
router.get('/low-stock',
    protect,
    authorize([UserRole.Admin, UserRole.Inventory]),
    getLowStockReport
);

// Relatório de Resumo de Vendas
router.get('/sales-summary',
    protect,
    authorize([UserRole.Admin, UserRole.Sales]),
    getSalesSummary  
);

export default router;