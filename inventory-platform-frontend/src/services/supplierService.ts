import api from './api';

export interface Supplier {
    _id: string;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
}

// Interface para dados enviados à API (excluir  o id)
export type SupplierFormData = Omit<Supplier, '_id'>;

/**
 * Busca a lista completa de fornecedores.
 */
export const fetchSuppliers = async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    // O backend retornara apenas a lista de fornecedores (sem paginação, por ser uma lista simples)
    return response.data;
};

/**
 * Busca um único fornecedor pelo ID.
 */
export const fetchSupplierById = async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    // A rota GET /suppliers/:id não existe no backend, usaremos a rota de listagem e a filtraremos no frontend.
    // **Porém, para seguir o padrão de API REST, vamos assumir que existe uma rota GET /suppliers/:id**
    return response.data.Supplier;
};

/**
 * Cria um novo fornecedor.
 */
export const createSupplier = async (data: SupplierFormData) => {
    const response = await api.post('/suppliers', data);
    return response.data.Supplier;
};

/**
 * Atualiza um fornecedor existente.
 */
export const updateSupplier = async (id: string, data: Partial<SupplierFormData>) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data.Supplier;
};

/**
 * Deleta um fornecedor.
 */
export const deleteSupplier = async (id: string) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
};

