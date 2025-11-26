import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../inventory-platform-backend/src/models/User';
import { useQuery } from '@tanstack/react-query';

// ----------------------------------------------------
// Estilos (Styled Components)
// ----------------------------------------------------

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const Card = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const CardTitle = styled.h3`
  color: #555;
  font-size: 16px;
  margin-bottom: 10px;
`;

const CardValue = styled.p`
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
`;

// ----------------------------------------------------
// Função de Busca de Estatísticas (Simulada)
// ----------------------------------------------------

// Função real que você chamaria na API (ex: GET /api/stats/summary)
const fetchStats = async () => {
    // Por enquanto, a API não tem esta rota, então vamos simular
    // Numa implementação real, a rota de stats traria estas contagens do MongoDB
    return {
        totalProducts: 125,
        lowStockAlerts: 15,
        totalSalesToday: 54,
    };
};

// ----------------------------------------------------
// Componente Dashboard
// ----------------------------------------------------

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // Use React Query para buscar os dados (caching e refetching automáticos)
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchStats,
        // Garante que a chamada só é feita se o usuário estiver logado
        enabled: !!user,
    });

    if (isLoading) {
        return <p>Carregando Estatísticas...</p>;
    }

    if (isError) {
        return <p style={{ color: 'red' }}>Erro ao carregar estatísticas do servidor.</p>;
    }

    // Se o usuário for null (nunca deveria acontecer, mas é um bom fallback)
    if (!user) {
        return <p>Aguardando dados do usuário...</p>;
    }

    return (
        <div>
            <h2>Dashboard Resumo ({user.role})</h2>
            <p>Acesso rápido às métricas mais importantes.</p>

            <DashboardGrid>
                <Card>
                    <CardTitle>Produtos Totais</CardTitle>
                    <CardValue>{stats?.totalProducts || 'N/A'}</CardValue>
                </Card>

                {/* Apenas usuários que gerenciam estoque devem ver o alerta */}
                {user.role !== UserRole.Sales && (
                    <Card style={{ borderLeft: '5px solid #e74c3c' }}>
                        <CardTitle>Alerta de Estoque Baixo</CardTitle>
                        <CardValue style={{ color: '#e74c3c' }}>{stats?.lowStockAlerts || 'N/A'}</CardValue>
                    </Card>
                )}

                <Card>
                    <CardTitle>Vendas Hoje</CardTitle>
                    <CardValue>{stats?.totalSalesToday || 'N/A'}</CardValue>
                </Card>

            </DashboardGrid>

            <div style={{ marginTop: '50px' }}>
                <h3>Nível de Acesso</h3>
                <p>Seu papel atual é: <strong>{user.role}</strong>.</p>
                <p>
                    Você pode ver as permissões no menu lateral. Por exemplo,
                    o papel "{UserRole.Sales}" não verá os links de Fornecedores.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;