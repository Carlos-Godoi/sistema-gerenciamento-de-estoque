import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Certifique-se de que o caminho está correto
import { UserRole } from '../../../inventory-platform-backend/src/models/User'; 

// ----------------------------------------------------
// Interfaces
// ----------------------------------------------------

interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

// ----------------------------------------------------
// Setup de Contexto e Query Client
// ----------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const queryClient = new QueryClient();

// ----------------------------------------------------
// 🎯 Lógica de Inicialização Preguiçosa
// ----------------------------------------------------

// Função utilitária para buscar o estado inicial do usuário no localStorage
const initializeUserFromStorage = (): User | null => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
        try {
            // Tenta fazer o parse do JSON
            return JSON.parse(storedUser) as User;
        } catch (e) {
            // Se o JSON for inválido, limpa o storage e retorna null
            console.error('Erro ao fazer parse do JSON do usuário:', e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }
    }
    return null;
};

// ----------------------------------------------------
// Provider Principal
// ----------------------------------------------------

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    // 1. CORREÇÃO: Inicialização do estado com a função initializeUserFromStorage
    // Isso garante que a leitura do localStorage aconteça APENAS UMA VEZ na inicialização.
    const [user, setUser] = useState<User | null>(initializeUserFromStorage);
    
    // O isAuthenticated é um estado derivado e funciona como estava
    const isAuthenticated = !!user;

    // 2. FUNÇÃO LOGIN
    const login = (token: string, userData: User) => {
        // O token é salvo separadamente para ser usado no Axios Interceptor
        localStorage.setItem('token', token);
        // O objeto user é salvo para manter o estado do usuário
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // 3. FUNÇÃO LOGOUT
    const logout = () => {
        // Limpa o storage e o estado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Limpa o cache do React Query
        queryClient.clear(); 
    };

    // O useEffect anterior (para carregar o usuário) foi removido
    // pois a lógica foi movida para o useState.

    return (
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
                {children}
            </AuthContext.Provider>
        </QueryClientProvider>
    );
};

// ----------------------------------------------------
// Hook customizado
// ----------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};