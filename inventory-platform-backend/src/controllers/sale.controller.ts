import { Request, Response } from 'express';
import Sale, { ISale } from '../models/Sale';
import Product, { IProduct } from '../models/Product';
import { AuthRequest } from './auth.controller';
import mongoose from 'mongoose';

/**
 * @route POST /api/sales
 * @desc Registra uma nova venda e atualiza o estoque. Requer role Admin ou Sales.
 */

export const recordSale = async (req: AuthRequest, res: Response) => {

    // Validação de autenticação
    if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Extração dos dados da venda (customerName é opcional)
    const { items, customerName } = req.body;

    // Verifica se há itens na venda
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'A venda deve conter itens.' });
    }

    // Estrutura para os novos itens da venda e IDs dos produtos
    const saleItems: ISale['items'] = [];
    const productIds = items.map((item: any) => item.productId);

    // ----------------------------------------------------
    // LÓGICA CRÍTICA: GARANTIR CONSISTÊNCIA
    // ----------------------------------------------------

    // Inicia uma sessão de transação (necessita de um Replica Set, mas é a abordagem correta)
    // Se não estiver usando Replica Set, o código abaixo deve ser feito sem transaction.
    // Para fins de estudo avançado, vamos mantê-lo.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Busca todos os produtos envolvidos de uma vez (otimização)
        const products = await Product.find({ 
            _id: { $in: productIds } 
        }).session(session);

        const productMap = new Map<string, IProduct>();
        products.forEach(p => productMap.set(p._id.toString(), p));

        // Verifica Estoque e Prepara os Itens da Venda
        for (const item of items) {
            const product = productMap.get(item.productId);

            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            }

            if (product.stockQuantity < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({ 
                    message: `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stockQuantity}.` 
                });
            }

            // Adiciona o item formatado para a venda (registra o preço atual!)
            saleItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtSale: product.price, // Preço fixado no momento da venda
            });

            // Atualiza a quantidade no objeto Product (será salvo depois)
            product.stockQuantity -= item.quantity;
        }

        // Calcula o total da venda (confirma a lógica do hook no modelo Sale)
        let totalAmount = saleItems.reduce((acc, item) => acc + item.quantity * item.priceAtSale, 0);

        // Cria o objeto Sale
        const newSale: Partial<ISale> = {
            customerName: customerName || 'Cliente Padrão',
            items: saleItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            processedBy: req.user._id,
        };

        const sale = await Sale.create([newSale], { session });

        // Atualiza todos os produtos envolvidos no DB (Baixa de Estoque)
        const updatePromises = products.map(p => p.save({ session }));
        await Promise.all(updatePromises);

        // Confirma a transação
        await session.commitTransaction();

        res.status(201).json({ 
            message: 'Venda registrada e estoque atualizado com sucesso.', 
            sale: sale[0] 
        });

    } catch (error) {
        // Aborta em caso de qualquer erro
        await session.abortTransaction();
        console.error('Erro na transação de venda:', error);
        res.status(500).json({ message: 'Erro ao processar a venda.' });
    } finally {
        session.endSession(); // Termina a sessão
    }
};

/**
 * @route GET /api/sales
 * @desc Lista todas as vendas. Requer role Admin ou Sales.
 */

export const getSales = async (req: AuthRequest, res: Response) => {
    try {
        // Implementar Paginação e Filtragem por data aqui (similar a getProducts)
        const sales = await Sale.find({})
        .limit(10)
        .sort({ saleDate: -1 })
        .populate({ path: 'processedBy', select: 'username' })
        .populate({ path: 'item.product', select: 'name sku' });

        res.json(sales);
    } catch (error) {
        console.error('Erro ao listar vendas:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};