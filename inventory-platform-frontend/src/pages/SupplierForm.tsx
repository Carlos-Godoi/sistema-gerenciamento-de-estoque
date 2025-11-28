import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSupplierById, createSupplier, updateSupplier, type SupplierFormData } from '../services/supplierService';

// ----------------------------------------------------
// Estilos (Reutilizando estilos de botões/inputs do Login)
// ----------------------------------------------------

// Estilos específicos
const FormContainer = styled.div`
  max-width: 600px;
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



const initialFormState: SupplierFormData = {
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
};

const SupplierForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const isEditing = !!id;
    const [formData, setFormData] = useState<SupplierFormData>(initialFormState);
    const [error, setError] = useState<string | null>(null);

    // 1. Buscar fornecedor existente (Apenas se for edição)
    const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
        queryKey: ['supplier', id],
        queryFn: () => fetchSupplierById(id!),
        enabled: isEditing,
        staleTime: Infinity,
    });

    // 2. Efeito para preencher o formulário
    useEffect(() => {
        if (isEditing && supplierData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(supplierData);
        }
    }, [isEditing, supplierData]);

    // 3. Mutation: Criação
    const createMutation = useMutation({
        mutationFn: (data: SupplierFormData) => createSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] }); // Invalida a lista
            navigate('/suppliers');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao criar fornecedor.');
        },
    });

    // 4. Mutation: Atualização
    const updateMutation = useMutation({
        mutationFn: (data: SupplierFormData) => updateSupplier(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            queryClient.invalidateQueries({ queryKey: ['supplier', id] });
            navigate('/suppliers');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao atualizar fornecedor.');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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

    if (isEditing && isLoadingSupplier) {
        return <p>Carregando dados do fornecedor...</p>;
    }

    const mutationError = error || createMutation.error?.message || updateMutation.error?.message;

    const title = isEditing ? `Editar Fornecedor: ${supplierData?.name}` : 'Cadastrar Novo Fornecedor';

    return (
        <FormContainer>
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <FormGrid>
                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                        <Label htmlFor='name'>Nome da Empresa</Label>
                        <Input type='text' name='name' value={formData.name} onChange={handleChange} required disabled={isSubmitting} />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor='contactName'>Pessoa de Contato</Label>
                        <Input type='text' name='contactName' value={formData.contactName} onChange={handleChange} required disabled={isSubmitting} />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor='phone'>Telefone</Label>
                        <Input type='tel' name='phone' value={formData.phone} onChange={handleChange} disabled={isSubmitting} />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor='email'>E-mail</Label>
                        <Input type='email' name='email' value={formData.email} onChange={handleChange} disabled={isSubmitting} />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                        <Label htmlFor='address'>Endereço</Label>
                        <Input as='textarea' name='address' value={formData.address} onChange={handleChange} rows={2} disabled={isSubmitting} />
                    </FormGroup>
                </FormGrid>

                {mutationError && <ErrorMessage>{mutationError}</ErrorMessage>}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor')}
                </Button>
                <Button
                    type="button"
                    onClick={() => navigate('/suppliers')}
                    style={{ backgroundColor: '#6c757d', marginLeft: '10px' }}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
            </form>
        </FormContainer>
    );
};

export default SupplierForm;