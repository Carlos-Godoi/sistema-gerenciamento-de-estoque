import { Response } from 'express';
import Product from '../models/Product';
import Sale from '../models/Sale';
import { AuthRequest } from './auth.controller';
import { UserRole } from '../models/User';
import { PipelineStage } from 'mongoose';

// ----------------------------------------------------
// RELATÓRIO 1: ESTOQUE BAIXO
// ----------------------------------------------------

/**
 * @route GET /api/reports/low-stock
 * @desc Lista produtos onde stockQuantity é menor que minStockLevel
 * Requer role Admin ou Inventory
 */

export const getLowStockReport = async (req: AuthRequest, res: Response) => {
    try {
        // Uso direto da query Mongoose (simples, não necessita Aggregation)
        const lowStockProducts = await Product.find({
            // $lt: "less than" (menor que)
            $expr: { $lt: ["$stockQuantity", "$minStockLevel"] }
        })
        .select('name sku stockQuantity minStockLevel supplier')
        .populate({ path: 'supplier', select: 'name phone' })
        .sort({ stockQuantity: 1 }); //Ordeba do menor estoque para o maior

        res.json({
            reportDate: new Date(),
            products: lowStockProducts,
            count: lowStockProducts.length,
        });

    } catch (error) {
        console.error('Erro ao gerar relatório de estoque baixo:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao gerar relatório.' });
    }
};

// ----------------------------------------------------
// RELATÓRIO 2: VENDAS POR PERÍODO E PRODUTO (AGREGAÇÃO)
// ----------------------------------------------------

/**
 * @route GET /api/reports/sales-summary
 * @desc Gera um resumo de vendas por produto em um determinado período
 * Requer role Admin ou Sales.
 */

export const getSalesSummary = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        // Validação do período
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Datas de onício e fim (startDate e endDate} são obrigatórias.'});
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // Corrige a data final para incluir todo o dia
        end.setHours(23, 59, 59, 999);

        // MongoDB Aggregation Pipeline (Processamento em 5 etapas)
        const pipeline: PipelineStage[] = [

            // 1. Filtrar vendas pelo período
            {
                $match: {
                    saleDate: { $gte: start, $lte: end }
                }
            },

            // 2. Desmembrar o array 'items' em documentos individuais
            {
                $unwind: "$items"
            },

            // 3. Agrupar por produto e calcular totais
            {
                $group: {
                    _id: "$items.product", // Agrupa pelo ID do produto
                    totalQuantitySold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtSale"] } },
                    countSales: { $sum: 1 } // // Conta o número de linhas de item (não o número de vendas, mas é útil)
                }
            },

            // 4. Buscar detalhes do Produto (JOIN com Collection 'products')
            {
                $lookup: {
                    from: 'products', // Nome da collection (geralmente plural e minúscula)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

            // 5. Formatar a saída (limpar e desmembrar o array 'productDetails')
            {
                $unwind: "$productDetails" // Desmenbra o array productDetails (que só tem 1 item)
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$productDetails.name",
                    productSku: "$productDetails.sku",
                    totalQuantitySold: 1,
                    totalRevenue: { $round: ["$totalRevenue", 2] }, // Arredonda receita
                    countSales: 1
                }
            },

            // 6. Ordenar por maior receita
            {
                $sort: { totalRevenue: -1 }
            }
        ];

        const summary = await Sale.aggregate(pipeline);

        res.json({
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            summary,
            totalItems: summary.length
        });

    } catch (error) {
        console.error('Erro ao gerar resumo de vendas:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao gerar relatório.' });
    }
};