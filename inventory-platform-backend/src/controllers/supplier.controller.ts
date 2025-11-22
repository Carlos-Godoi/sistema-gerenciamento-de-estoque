 import { Request, Response } from 'express';
 import Supplier, { ISupplier } from '../models/Supplier';
 import { AuthRequest } from './auth.controller';

 /**
  * @route POST /api/suppliers
  * @desc Cria um novo fornecedor. Requer role Admin ou Inventory
  */

 export const createSupplier = async (req: AuthRequest, res: Response) => {
    try {
        const { name, contactName, phone, email, address } = req.body;

        if (!name || !contactName) {
            return res.status(400).json({ message: 'Nome e Nome de Contato são obrigatórios.' });
        }

        const newSupplier: Partial<ISupplier> = {
            name,
            contactName,
            phone,
            email,
            address,
        };

        const supplier = await Supplier.create(newSupplier);
        res.status(201).json({ message: 'Fornecedor registrado com sucesso.', supplier });

    } catch (error: any) {
        // Tratar erro de índice duplicado (nome único)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um fornecedor com este nome.' });
        }
        console.error('Erro ao criar fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
 };

 /**
  * @route GET /api/suppliers
  * @desc Retorna todos os fornecedores (pode ser usado em dropdowns e listagens)
  */

 export const getSuppliers = async (req: AuthRequest, res: Response) => {
    try {
        // Listagem simples, sem paginação
        const suppliers = await Supplier.find().sort({ name: 1 });
        res.json(suppliers);
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
 };

 /**
  * @route PUT /api/suppliers/:id
  * @desc Atualiza um fornecedor. Requer role Admin ou Inventory
  */

 export const updateSupplier = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const supplier = await Supplier.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true // Garante que as validações do schema sejam executadas
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Fornecedor não encontrado.' });
        }

        res.json({ message: 'Fornecedor atualizado com sucesso.',supplier });
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
 };

 /**
  * @route DELETE /api/suppliers/:id
  * @desc Deleta um fornecedor. Requer role Admin
  */

 export const deleteSupplier = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Lógica de Negócio Crucial: Antes de deletar, verificar se há produtos relacionados
        const productsCount = await Supplier.countDocuments({ supplier: id });

        if (productsCount > 0) {
            return res.status(400).json({ message: `Não é possível deletar esta fornecedor. Ele está vinculado a ${productsCount} produtos.` });
        }

        const supplier = await Supplier.findByIdAndDelete(id);

        if (!supplier) {
            return res.status(404).json({ message: 'Fornecedor não encontrado.' });
        }

        res.json({ message: 'Fornecedor deletado com sucesso.', supplier });
    } catch (error) {
        console.error('Erro ao deletar fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
 };