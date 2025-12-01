import { Request, Response } from 'express';
import User, { IUser, UserRole } from '../models/User';
import { AuthRequest } from './auth.controller';

/**
 * @route POST /api/users
 * @desc Cria um novo usuário. Requer role Admin.
 */
export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const { username, email, password, role } = req.body;

        // 1. Validação básica
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios, incluindo a senha.' });
        }

        // 2. Cria o usuário (o hook 'pre' do mongoose hasheará a senha)
        const newUser: Partial<IUser> = { username, email, password, role };

        const user = await User.create(newUser);

        // 3. Retorna o usuário crado, excluindo a senha
        res.status(201).json({
            message: 'Usuário criado com sucesso.',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Nome de usuário ou e-mail já existe.' });
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route GET /api/users
 * @desc Lista todos os usuários. Requer role Admin.
 */
export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        // Exclui o campo 'password' de todos os documentos
        const users = await User.find({}).select('-password').sort({ role: 1, username: 1 });
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route GET /api/users/:id
 * @desc Busca um único usuário. Requer role Admin.
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route PUT /api/users/:id
 * @desc Atualiza um usuário. Requer role Admin.
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { username, email, role, password } = req.body;
        const updates: any = {};

        if (username) updates.username = username;
        if (email) updates.email = email;
        if (role) updates.role = role;

        // Se a senha foi fornecida, o hook 'pre save' do Mongoose irá hasheá-la
        if (password) updates.password = password;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Usuário atualizado com sucesso.', user });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route DELETE /api/users/:id
 * @desc Deleta um usuário. Requer role Admin.
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const userIdToDelete = req.params.id;
        const loggedInUserId = req.user?._id.toString();

        // 1. Impedir auto-exclusão
        if (userIdToDelete === loggedInUserId) {
            return res.status(403).json({ message: 'Um administrador não pode deletar sua própria conta enquanto estiver logado.' });
        }

        const user = await User.findByIdAndDelete(userIdToDelete);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrador.' });
        }

        res.json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};