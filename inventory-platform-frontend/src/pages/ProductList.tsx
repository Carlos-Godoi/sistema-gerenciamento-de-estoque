import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productService';
// import useMemo

// ----------------------------------------------------
// Estilos (Minimalista para focar na lógica)
// ----------------------------------------------------

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ControlBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
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

const AlertTag = styled.span<{ lowStock: boolean }>`
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    background-color: ${props => props.lowStock ? '#e74c3c' : '#2ecc71'};
`;


// ----------------------------------------------------
// Componente ProductList
// ----------------------------------------------------
const ProductList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [keyword, setKeyword] = useState(''); // Estado para filtro que aciona a busca
    const limit = 10;

    // Debouncing simples para a busca (melhora a performance evitando requests a cada tecla)
    // useMemo reage apenas quando a `keyword` de busca muda
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setKeyword(searchKeyword);
        }, 500); // Espera 500ms

        return () => clearTimeout(handler);
    }, [searchKeyword]);

    // React Query: Chave de consulta (queryKey) é crucial para caching e refetching
    const queryKey = ['products', { page: currentPage, limit, keyword }];

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey,
        queryFn: () => fetchProducts({ page: currentPage, limit, keyword }),
        placeholderData: (previousData) => previousData, // Mantém dados anteriores durante o `isFetching`
        staleTime: 60000, // Dados são considerados "frescos" por 1 minuto
    });

    const products = data?.products || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
            setCurrentPage(newPage);
        }
    };

    // Exemplo de tela que seria chamada para criar um produto
    const handleCreateNew = () => {
        console.log('Navegar para tela de criação de produto...');
        // navigate('/products/new');
    };

    if (isError) {
        return <p style={{ color: 'red' }}>Erro ao carregar a lista de produtos.</p>;
    }

    return (
        <div>
            <PageHeader>
                <h2>Lista de Produtos</h2>
                <Button onClick={handleCreateNew}>+ Novo Produto</Button>
            </PageHeader>

            <ControlBar>
                <Input type="text"
                    placeholder='Buscar por Nome ou SKU'
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />{/* Futuro: Dropdown para filtrar por fornecedor */}
            </ControlBar>

            {/* Indicador de carregamento e fetching */}
            {(isLoading || isFetching) && <p>{isLoading ? 'Carregando dados...' : 'Atualizando dados...'}</p>}

            <Table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Fornecedor</th>
                        <th>Criado por</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 && !isLoading ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center'}}>Nenhum produto encontrado.</td></tr>
                    ) : (
                        products.map((p) => (
                            <tr key={p._id}>
                                <td>{p.sku}</td>
                                <td>{p.name}</td>
                                <td>R$ {p.price.toFixed(2)}</td>
                                <td>
                                    {p.stockQuantity}
                                    {p.stockQuantity < p.minStockLevel && (
                                        <span style={{ color: 'red', marginLeft: '5px' }}> (Baixo!)</span>
                                    )}
                                </td>
                                <td>{p.supplier.name}</td>
                                <td>{p.createdBy.username}</td>
                                <td>
                                    <AlertTag lowStock={p.stockQuantity < p.minStockLevel}>
                                        {p.stockQuantity < p.minStockLevel ? 'Alerta' : 'OK'}
                                    </AlertTag>
                                </td>
                                <td>
                                    <Button style={{ marginRight: '5px', backgroundColor: '#f39c12' }} disabled={isFetching}>Editar</Button>
                                    <Button style={{ backgroundColor: '#c0392b' }} disabled={isFetching}>Deletar</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Controles de Paginação */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination>
                    <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isFetching}
                    >
                        Página Anterior
                    </Button>
                    <span>
                        Página **{currentPage}** de **{pagination.totalPages}**
                    </span>
                    <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage || isFetching}
                    >
                        Próxima Página
                    </Button>
                </Pagination>
            )}
        </div>
    );
};



export default ProductList;