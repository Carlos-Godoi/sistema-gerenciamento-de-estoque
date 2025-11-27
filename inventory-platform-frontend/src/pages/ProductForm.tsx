import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductById, createProduct, updateProduct, type ProductFormData } from '../services/productService';
import { fetchSuppliers } from '../services/supplierService';

// ----------------------------------------------------
// Estilos (Reutilizando estilos de botões/inputs do Login)
// ----------------------------------------------------

const FormContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: white;
`;

const Button = styled.button`
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-top: 10px;

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
  text-align: center;
`;

// ----------------------------------------------------
// Componente ProductForm
// ----------------------------------------------------

const initialFormState: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  minStockLevel: 10,
  supplier: '',
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Captura o ID da URL se for Edição
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const isEditing = !!id;
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  // 1. Busca Lista de Fornecedores (Sempre necessária)
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  });

  // 2. Busca Produto Existente (Apenas se for Edição)
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: isEditing, // Só executa a busca se houver um ID
    staleTime: Infinity,
  });

  // 3. Efeito para preencher o formulário quando os dados do produto chegarem
  useEffect(() => {
    if (isEditing && productData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        minStockLevel: productData.minStockLevel,
        // Garante que o ID do fornecedor seja usado, não o objeto populado
        supplier: productData.supplier._id, 
      });
    }
  }, [isEditing, productData]);

  // 4. Mutation: Criação de Produto
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: () => {
      // Invalida o cache da listagem para forçar a atualização (MUITO IMPORTANTE!)
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
      navigate('/products'); // Redireciona para a listagem
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erro ao criar produto.');
    },
  });

  // 5. Mutation: Atualização de Produto
  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
      queryClient.invalidateQueries({ queryKey: ['product', id] }); // Atualiza o cache do item editado
      navigate('/products');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erro ao atualizar produto.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Converte valores numéricos para number
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
    setError(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoadingSuppliers || (isEditing && isLoadingProduct)) {
    return <p>Carregando dados do formulário...</p>;
  }
  
  const mutationError = error || createMutation.error?.message || updateMutation.error?.message;
  
  const title = isEditing ? `Editar Produto: ${productData?.name}` : 'Cadastrar Novo Produto';

  return (
    <FormContainer>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <FormGrid>
            <FormGroup>
                <Label htmlFor="name">Nome</Label>
                <Input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="sku">SKU (Código Único)</Label>
                {/* O SKU não pode ser alterado após a criação para manter a integridade */}
                <Input type="text" name="sku" value={formData.sku} onChange={handleChange} required disabled={isSubmitting || isEditing} />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Select name="supplier" value={formData.supplier} onChange={handleChange} required disabled={isSubmitting}>
                    <option value="">-- Selecione um Fornecedor --</option>
                    {suppliers?.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.name}
                        </option>
                    ))}
                </Select>
            </FormGroup>

            <FormGroup>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} required min="0.01" step="0.01" disabled={isSubmitting} />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="stockQuantity">Estoque Atual</Label>
                <Input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" disabled={isSubmitting} />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="minStockLevel">Nível Mínimo de Estoque</Label>
                <Input type="number" name="minStockLevel" value={formData.minStockLevel} onChange={handleChange} required min="0" disabled={isSubmitting} />
            </FormGroup>
        </FormGrid>
        
        <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label htmlFor="description">Descrição</Label>
            <Input as="textarea" name="description" value={formData.description} onChange={handleChange} rows={3} disabled={isSubmitting} />
        </FormGroup>

        {mutationError && <ErrorMessage>{mutationError}</ErrorMessage>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Produto')}
        </Button>
        <Button 
            type="button" 
            onClick={() => navigate('/products')} 
            style={{ backgroundColor: '#6c757d', marginLeft: '10px' }}
            disabled={isSubmitting}
        >
            Cancelar
        </Button>
      </form>
    </FormContainer>
  );
};

export default ProductForm;