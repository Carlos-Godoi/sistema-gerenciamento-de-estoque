import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsersById, createUser, updateUser, type UserFormData } from '../services/userService';
import { UserRole } from '../../../inventory-platform-backend/src/models/User';
import styled from 'styled-components';

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
  display: grid;mGroup, Label, Input, Select, Button, ErrorMessage } from './ProductForm'; 
  
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

const initialFormState: UserFormData = {
    username: '',
    email: '',
    password: '',
    role: UserRole.Inventory, // Padrão
};

const UserForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const isEditing = !!id;
    const [formData, setFormData] = useState<UserFormData>(initialFormState);
    const [error, setError] = useState<string | null>(null);

    // 1. Busca usuário existente (Apenas se for editar)
    const { data: userData, isLoading: isLoadingUser } = useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUsersById(id!),
        enabled: isEditing,
    });

    // 2. Efeito para preencher o formulário
    useEffect(() => {
        if (isEditing && userData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                username: userData.username,
                email: userData.email,
                role: userData.role,
                password: '', // Nunca preenche o campo de senha
            });
        }
    }, [isEditing, userData]);

    // 3. Mutation: Criação
    const createMutation = useMutation({
        mutationFn: (data: UserFormData) => createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/users');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao criar usuário.');
        },
    });

    // 4. Mutation: Atualização
    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserFormData>) => updateUser(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            navigate('/users');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            setError(err.message?.data?.message || 'Erro ao atualizar usuário.');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filtra dados para não enviar campos (como senha na edição)
        const dataToSend = isEditing
            ? Object.fromEntries(Object.entries(formData).filter(([key, value]) => key !== 'password' && value !== ''))
            : formData;

        if (isEditing) {
            updateMutation.mutate(dataToSend);
        } else {
            // Garante que a senha foi fornecida na criação
            if (!formData.password) {
                return setError('A senha é obrigatória para a criação de novo usuário.');
            }
            createMutation.mutate(dataToSend as UserFormData);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    if (isEditing && isLoadingUser) {
        return <p>Carregando dados do usuário...</p>;
    }

    const mutationError = error || createMutation.error?.message || updateMutation.error?.message;

    const title = isEditing ? `Editar Usuário: ${userData?.username}` : 'Cadastrar Novo Usuário';

    return (
        <FormContainer>
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor='username'>Nome de Usuário</Label>
                        <Input type='text' name='username' value={formData.username} onChange={handleChange} required disabled={isSubmitting || isEditing} />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor='email'>E-mail</Label>
                        <Input type='email' name='email' value={formData.email} onChange={handleChange} required disabled={isSubmitting || isEditing} />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor='role'>Nível de Acesso (Role)</Label>
                        <Select name='role' value={formData.role} onChange={handleChange} required disabled={isSubmitting}>
                            {Object.values(UserRole).map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor='password'>Senha {isEditing ? '(Deixe vazio para manter a senha atual)' : ''}</Label>
                        <Input type='password' name='password' value={formData.password} onChange={handleChange} required={!isEditing} disabled={isSubmitting} />
                    </FormGroup>
                </FormGrid>

                {mutationError && <ErrorMessage>{mutationError}</ErrorMessage>}

                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário')}
                </Button>
            </form>
        </FormContainer>
    );
};

export default UserForm;