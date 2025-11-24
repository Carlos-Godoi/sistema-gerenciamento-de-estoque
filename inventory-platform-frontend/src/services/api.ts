import axios from 'axios';


// 1. Definição da URL da API (Backend)
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// 2. Interceptors: Adiciona o Token JWT em todas as requisições
api.interceptors.request.use(
    (config) => {
        // Busca o token do localStorege
        const token = localStorage.getItem('token');

        // Se o token existir, adiciona ao cabeçalho Authorization
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
        // Se o erro for 401 (Não Autorizado), e não for a rota de login
        if (error.response && error.response.status === 401 && error.config.URL !== '/auth/login') {
            console.log('Token expirado ou inválido. Redirecionando para login.');

            // Limpa o token e redireciona o usuário para a página de login
            localStorage.removeItem('token');

            // Redirecionamento deve ser feito via Router ou Context
            // Para o escopo do Axios, apenas forçamos um erro para o componente tratar.

            // Nota: Em um projeto real, você usaria o history/navigate do router aqui.
        }
        return Promise.reject(error);
    }
);

export default api;