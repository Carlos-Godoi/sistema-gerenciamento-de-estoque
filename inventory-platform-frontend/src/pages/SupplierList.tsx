import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSuppliers, deleteSupplier } from '../services/supplierService';

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



// ----------------------------------------------------
// Componente SupplierList
// ----------------------------------------------------

const SupplierList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. Busca a lista de fornecedores
    const { data: suppliers, isLoading, isError, isFetching } = useQuery({
        queryKey: ['suppliers'],
        queryFn: fetchSuppliers,
        staleTime: 5 * 60 * 1000, // Fresco por 5 minutos
    });

    // 2. Mutation para Deletar Fornecedor
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSupplier(id),
        onSuccess: (response) => {
            // Exibe a mensagem de erro se a API impedir a exclusão
            if (response.message.includes('Não é possível deletar')) {
                alert(response.message);
            } else {
                // Se bem-sucedido, invalida o cache para refetch
                queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Erro ao deletar fornecedor.');
        },
    });

    const handleCreateNew = () => {
        navigate('/suppliers/new');
    };

    const handleDelete = (id: string, name: string) => {
        // 1. Confirmação do Usuário
        if (window.confirm(`Tem certeza que deseja deletar o fornecedor "${name}"?`)) {

            // 2. Chama a Mutation (o processo assíncrono de exclusão)
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return <p style={{ color: 'red' }}>Carregando fornecedores...</p>;
    }

    if (isError) {
        return <p style={{ color: 'red' }}>Erro ao carregar a lista de fornecedores.</p>;
    }

    return (
        <div>
            <PageHeader>
                <h2>Lista de Fornecedores</h2>
                <Button onClick={handleCreateNew}>+ Novo Fornecedor</Button>
            </PageHeader>

            {isFetching && (<p>Atualizando dados...</p>)}

            <Table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Contato</th>
                        <th>Telefone</th>
                        <th>E-mail</th>
                        <th>Endereço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers?.length === 0 && !isLoading ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center' }}>Nenhum fornecedor cadastrado.</td></tr>
                    ) : (
                        suppliers?.map(({ _id, name, contactName, phone, email, address }) => (
                            <tr key={_id}>
                                <td>{name}</td>
                                <td>{contactName}</td>
                                <td>{phone}</td>
                                <td>{email}</td>
                                <td>{address}</td>
                                <td>
                                    <Button
                                        style={{ marginRight: '5px', backgroundColor: '#f39c12' }}
                                        disabled={isFetching || deleteMutation.isPending}
                                        onClick={() => navigate(`/suppliers/edit/${_id}`)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        style={{ backgroundColor: '#c0392b' }}
                                        disabled={isFetching || deleteMutation.isPending}
                                        onClick={() => handleDelete(_id, name)}
                                    >
                                        Deletar
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default SupplierList;