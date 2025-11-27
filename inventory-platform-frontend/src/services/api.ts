// api.ts

import axios from 'axios';

// Esses tipos são do backend e não são necessários neste arquivo de configuração do Axios (frontend/cliente).

// 1. Definição da URL da API (Backend)
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// 2. Interceptors: Adiciona o Token JWT em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor de Resposta: Trata Erros de Autenticação Globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config.url;

        // Condição para checar se a rota é a de login
        const isLoginRoute = requestUrl === 'auth/login' || requestUrl === '/auth/login';

        // ➡️ CORREÇÃO DA SINTAXE E DA LÓGICA:
        // Verifica 1. Status 401 E 2. Se a rota *NÃO* é a de login.
        if (
            error.response &&
            error.response.status === 401 &&
            !isLoginRoute // Usa a variável booleana
        ) {
            console.log('Token expirado ou inválido. Redirecionando para login.');

            // Limpa o token
            localStorage.removeItem('token');

            // Aqui você deve colocar a lógica de redirecionamento (ex: window.location.href = '/login')
        }
        return Promise.reject(error);
    }
);

export default api;