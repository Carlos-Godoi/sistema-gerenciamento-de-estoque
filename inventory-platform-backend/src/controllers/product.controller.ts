import { Response } from 'express';
import Product, { IProduct } from '../models/Product';
import { UserRole } from '../models/User';
import { AuthRequest } from './auth.controller'; // Tipo de Request com `user`

/**
 * @route POST /api/products
 * @desc Cria um novo produto. Requer role Admin ou Inventory.
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
  // O req.user é injetado pelo middleware 'protect'
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const { name, sku, description, price, stockQuantity, minStockLevel, supplier } = req.body;

    // Lógica Avançada: Validação
    if (!name || !sku || !price || !supplier) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
    }

    const newProduct: Partial<IProduct> = {
      name,
      sku,
      description,
      price,
      stockQuantity: stockQuantity || 0,
      minStockLevel: minStockLevel || 10,
      supplier,
      createdBy: req.user._id, // Define o usuário logado como criador
    };

    const product = await Product.create(newProduct);
    
    // Retorna o produto recém-criado e popula o nome do fornecedor/criador (opcional)
    await product.populate([
      { path: 'supplier', select: 'name' },
      { path: 'createdBy', select: 'username' }
    ]);

    res.status(201).json({ 
      message: 'Produto criado com sucesso.', 
      product 
    });
  } catch (error: any) {
    // Trata erro de índice duplicado (ex: SKU já existe)
    if (error.code === 11000) {
        return res.status(400).json({ message: 'SKU já registrado. Por favor, use um código único.' });
    }
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @route GET /api/products
 * @desc Retorna a lista de produtos com Paginação e Filtragem. Requer Autenticação.
 */
export const getProducts = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Paginação (padrões sensatos)
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // 2. Filtragem e Busca
        const filter: any = {};
        const keyword = req.query.keyword as string;
        const supplierId = req.query.supplier as string;

        if (keyword) {
            // Busca case-insensitive por nome ou SKU (usando $or e regex)
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { sku: { $regex: keyword, $options: 'i' } },
            ];
        }

        if (supplierId) {
            filter.supplier = supplierId; // Filtra por ID de fornecedor
        }

        // 3. Consulta ao DB
        const products = await Product.find(filter)
            .limit(limit)
            .skip(skip)
            .sort({ name: 1 }) // Ordena por nome
            // 4. População (Adiciona dados relacionados do Supplier e User)
            .populate([
                { path: 'supplier', select: 'name' },
                { path: 'createdBy', select: 'username' }
            ]);

        // 5. Cálculo do total para a Paginação
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            products,
            pagination: {
                totalProducts,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
            },
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route PUT /api/products/:id
 * @desc Atualiza um produto. Requer role Admin ou Inventory.
 */
export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findByIdAndUpdate(id, updates, { 
            new: true, 
            runValidators: true // Garante que o Mongoose execute as validações do schema
        })
        .populate([
            { path: 'supplier', select: 'name' },
            { path: 'createdBy', select: 'username' }
        ]);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.json({ 
            message: 'Produto atualizado com sucesso.', 
            product 
        });
    } catch (error: any) {
        // Trata erro de validação (ex: preço negativo)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route DELETE /api/products/:id
 * @desc Deleta um produto. Requer role Admin.
 */
export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Lógica de Negócio: Se o produto fosse referenciado em muitas vendas,
        // você poderia optar por marcá-lo como `isActive: false` em vez de deletar
        // permanentemente. Neste exemplo, faremos a exclusão para simplificar.

        res.json({ 
            message: 'Produto deletado com sucesso.', 
            product 
        });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};