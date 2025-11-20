import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../controllers/auth.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_nao_seguro';

/**
 * Middleware de autenticação (Proteger a Rota)
 * Verificar se um token JWT válido está presente no cabeçalho 'Autrorization'.
 */

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Checa se o token está no cabeçalho 'Authorization: Bearer <token>'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // 401 Unauthorized: Ausência de credenciais válidas.
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        // Verificar e decodificar o token 
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Busca o usuário no DB e anexa ao objeto request (útil para controllers)
        // Usamos .findById(decoded.id) para garantir que o usuário ainda existe
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Usuário do token não encontrado.' });
        }

        req.user = user;
        next(); // Continua para o próximo middleware/controller

    } catch (error) {
        // 401 Unauthrized: Token inválido ou expirado.
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

/**
 * Middleware de Autorização (Verifica o nível de permissão)
 * Recebe roles permitidos e restringe o acesso
 */

export const authorize = (roles: UserRole[] = []) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        
        // req.user foi anexado pelo middleware 'protect'
        if (!req.user) {
            return res.status(500).json({ message: 'Erro de Autorização: Usuário não anexado.' });
        }

        if (!roles.includes(req.user.role)) {
            // 403 Forbidden: Acesso negado, mas as credenciais são válidas.
            return res.status(403).json({ message: `Acesso negado. Necessário o papel: ${roles.join(' ou ')}`});
        }
        next();
    };
};