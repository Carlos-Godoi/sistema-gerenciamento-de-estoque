import api from './api';
import { UserRole } from '../../../inventory-platform-backend/src/models/User';

export interface User {
    _id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface UserFormData {
    username: string;
    email: string;
    password?: string; // Opcional na edição
    role: UserRole;
}

/**
 * Busca a lista de usuários.
 */
export const fetchUsers = async (): Promise<User[]> => {
    // Assume-se que existe uma rota GET /users no backend, protegida por 'Admin'
    const response = await api.get('/users');
    return response.data;
};

/**
 * Busca um único usuário pelo ID
 */
export const fetchUsersById = async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
};

/**
 * Cria um novo usuário.
 */
export const createUser = async(data: UserFormData): Promise<User> => {
    // Rota de criação deve ser diferente da rota de registro inicial (se esta ainda existir)
    const response = await api.post('/users', data);
    return response.data.user;
};

/**
 * Atualiza um usuário existente.
 */
export const updateUser = async (id: string, data: Partial<UserFormData>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.user;
};

/**
 * Delete um usuário.
 */
export const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
};