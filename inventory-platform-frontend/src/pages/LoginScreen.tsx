import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserRole } from '../../../inventory-platform-backend/src/models/User';

// ----------------------------------------------------
// Estilos (Styled Components)
// ----------------------------------------------------

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f7f6;
`;

const FormWrapper = styled.div`
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 24px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Garante que padding não afete a largura total */
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  margin-top: 15px;
`;

// ----------------------------------------------------
// Componente LoginScreen
// ----------------------------------------------------

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hook customizado para acesso ao contexto de autenticação
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se já estiver autenticado, redireciona imediatamente
  if (isAuthenticated) {
    return <LoginContainer>Redirecionando...</LoginContainer>;
    // navigate('/dashboard', { replace: true });
    // return null; 
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });

      const { token, user } = response.data;

      // Validação de tipo (TypeScript) dos dados de usuário recebidos
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as UserRole, // Garantimos que o role é um tipo conhecido
      };

      // 1. Chama a função de login do AuthContext, salvando o token e o usuário
      login(token, userData);

      // 2. Redireciona para o Dashboard
      navigate('/dashboard', { replace: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // 3. Trata erros de requisição (ex: 401 Credenciais inválidas)
      const message = err.response?.data?.message || 'Erro de conexão ou credenciais inválidas.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <FormWrapper>
        <Title>Sistema de Inventário</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nome de Usuário (Ex: Admin)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : 'Entrar'}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'left' }}>
            {/* O <div> é um elemento de bloco e pode conter <ul> */}
            <p style={{ margin: '0 0 5px 0' }}>Usuários de Teste:</p>
            {/* A palavra "Usuários de Teste" pode ficar em um <p> ou <span> */}
          
          </div>

        </form>
      </FormWrapper>
    </LoginContainer>
  );
};

export default LoginScreen;