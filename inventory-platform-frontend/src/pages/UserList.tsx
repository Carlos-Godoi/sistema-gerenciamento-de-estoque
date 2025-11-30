import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, deleteUser } from '../services/userService';
import styled from 'styled-components';

// ----------------------------------------------------
// Estilos (Minimalista para focar na lógica)
// ----------------------------------------------------

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  th {
    background-color: #f4f4f4;
  }
`;


const Button = styled.button`
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

import { useAuth } from '../context/AuthContext';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth(); // Usuário logado

  // 1. Busca a lista de usuários
  const { data: users, isLoading, isError, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // 2. Mutation para Deletar Usuário
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Erro ao deletar usuário.');
    },
  });
  
  const handleDelete = (id: string, username: string) => {
    // Impedir que o Admin se auto-exclua
    if (id === currentUser?.id) {
        return alert('Você não pode deletar sua própria conta enquanto estiver logado.');
    }
    
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${username}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p>Carregando usuários...</p>;
  if (isError) return <p style={{ color: 'red' }}>Erro ao carregar a lista de usuários.</p>;

  return (
    <div>
      <PageHeader>
        <h2>Gerenciamento de Usuários</h2>
        <Button onClick={() => navigate('/users/new')}>+ Novo Usuário</Button>
      </PageHeader>
      
      {isFetching && <p>Atualizando dados...</p>}
      
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome de Usuário</th>
            <th>Email</th>
            <th>Role</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u._id}>
              <td>{u._id.substring(0, 8)}...</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <Button 
                  style={{ marginRight: '5px', backgroundColor: '#f39c12' }} 
                  onClick={() => navigate(`/users/edit/${u._id}`)}
                  disabled={isFetching}
                >
                  Editar
                </Button>
                <Button 
                  style={{ backgroundColor: '#c0392b' }} 
                  onClick={() => handleDelete(u._id, u.username)}
                  disabled={isFetching || deleteMutation.isPending || u._id === currentUser?.id}
                >
                  Deletar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserList;