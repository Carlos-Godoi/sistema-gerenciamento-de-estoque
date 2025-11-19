import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

// Assuma que JWT_SECRET está definido no .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_nao_seguro';

// Interface customizada para o Request do Express, adicionando o user (opcional)
export interface AuthRequest extends Request {
    user?: IUser
}

/**
 * @route POST /api/auth/login
 * @desc Autentica um usuário e retorna um JWT.
 */
export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        //Busca o usuário (incluindo a senha, pois ela foi marcada com select: false)
        const user = await User.findOne({ username }).select('+password');

        // Verificar se o usuário existe
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Comparar a senha (método definido no User Schema)
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Gerar o Token JWT
        const payload = {
            id: user._id,
            username: user.username,
            role: user.role,    // Crucial para autorizão
        };

        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1d' } // Token expira em 1 dia 
        );

        // Retornar o token e os dados do usuário 
        return res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};