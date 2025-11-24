import React, { createContext, useState, useEffect, useContext} from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '../../../inventory-platform-backend/src/models/User';

// Estrutura do usuário logado
interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
}

// Estrutura do Context de Autenticação
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const queryClient = new QueryClient();

// Provider Principal que envolve o App
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  // 1. Efeito para carregar o usuário do localStorage na montagem
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        // O Axios Interceptor já cuidará de adicionar o token.
      } catch (e) {
        // Loga o erro para o console
        console.error('Erro ao fazer parse do JSON do usuário:', e);

        // Limpa se o JSON for inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

    // 2. Funções de manipulação de estado
    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        queryClient.clear(); // Limpa o cache do React Query
    };

    return (
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
                {children}
            </AuthContext.Provider>
        </QueryClientProvider>
    );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};