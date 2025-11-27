import api from './api';

export interface Supplier {
    _id: string;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
}

export const fetchSuppliers = async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    // O backend retornara apenas a lista de fornecedores (sem paginação, por ser uma lista simples)
    return response.data;
};