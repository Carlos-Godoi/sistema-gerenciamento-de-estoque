import api from './api';

// Tipagem simplificada do Produto para o Frontend
export interface Product {
    _id: string;
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    minStockLevel: number;
    // População: Apenas o nome do fornecedor/criador é relevante para a listagem
    supplier: { _id: string; name: string };
    createdBy: { _id: string; username: string };
}

// Estrutura de resposta da API (inclui a paginação)
interface ProductsResponse {
    products: Product[];
    pagination: {
        totalProducts: number;
        currentPage: number;
        totalPages:number;
        hasNextPage: boolean;
    };
}

interface ProductFilters {
    page:number;
    limit: number;
    keyword?: string; // Para busca por nome ou SKU
    supplier?: string; // Para filtrar por fornecedor ID
}

/**
 * Busca produtos na API com paginação e filtros.
 */

export const fetchProducts = async (filters: ProductFilters): Promise<ProductsResponse> => {
    // Converte o objeto de filtros em parâmetros de query string
    const response = await api.get('/products', {
        params: filters,
    });
    return response.data;
};

// Implementaremos funções para CADASTRAR, EDITAR e DELETAR futuramente
// export const createProduct = async (data: any) => api.post('/products', data);
// export const deleteProduct = async (id: string) => api.delete(`/products/${id}`);