import api from './api';

// Tipagem simplificada do Produto para o Frontend
export interface Product {
    _id: string;
    name: string;
    sku: string;
    description: string;
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

// Interface para dados enviados à API
export interface ProductFormData {
    name: string;
    sku: string;
    description: string;
    price: number;
    stockQuantity: number;
    minStockLevel: number;
    supplier: string; // ID do fornecedor
}

/**
 * Busca um único produto pelo ID (para edição).
 */
export const fetchProducts = async (filters: ProductFilters): Promise<ProductsResponse> => {
    // Converte o objeto de filtros em parâmetros de query string
    const response = await api.get('/products', {
        params: filters,
    });
    return response.data;
};

/**
 * Busca um único produto pelo ID (para edição).
 */
export const fetchProductById = async (id: string): Promise<Product> => {
  // A rota GET /products/:id retorna { message, product }
  const response = await api.get(`/products/${id}`);
  return response.data.product; 
};

/**
 * Criar um novo produto
 */
export const createProduct = async (data: ProductFormData) => {
    const response = await api.post('/products', data);
    return response.data.product;
};

/**
 * Atualiza um produto existente
 */
export const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data.product;
}

// Implementaremos funções para CADASTRAR, EDITAR e DELETAR futuramente
// export const createProduct = async (data: any) => api.post('/products', data);
// export const deleteProduct = async (id: string) => api.delete(`/products/${id}`);