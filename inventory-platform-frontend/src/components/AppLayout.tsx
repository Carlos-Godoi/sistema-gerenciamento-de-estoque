import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../inventory-platform-backend/src/models/User';

// ----------------------------------------------------
// Estilos (Styled Components)
// ----------------------------------------------------

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f7f6;
`;

const Sidebar = styled.nav`
  width: 250px;
  background-color: #2c3e50; /* Azul escuro/Petróleo */
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const NavLink = styled(Link)`
  padding: 15px 20px;
  text-decoration: none;
  color: white;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #34495e;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 30px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #c0392b; /* Vermelho escuro */
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 4px;
  transition: color 0.3s;
  
  &:hover {
    color: #e74c3c;
  }
`;

const UserInfo = styled.div`
    font-size: 14px;
    color: #ecf0f1;
    padding: 15px 20px 30px;
    text-align: center;
    border-bottom: 1px solid #34495e;
    margin-bottom: 10px;

    span {
        display: block;
        font-weight: bold;
        text-transform: capitalize;
    }
`;

// ----------------------------------------------------
// Componente AppLayout
// ----------------------------------------------------

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();

  // Função auxiliar para verificar permissão
  const isAllowed = (roles: UserRole[]): boolean => {
    return user && roles.includes(user.role) || false;
  };

  return (
    <LayoutContainer>
      <Sidebar>
        {user && (
            <UserInfo>
                Bem-vindo(a), <br/>
                <span>{user.username}</span>
                (Role: {user.role})
            </UserInfo>
        )}
        
        <NavLink to="/dashboard">🏠 Dashboard</NavLink>

        {/* Links de Gerenciamento (Admin/Inventory) */}
        {isAllowed([UserRole.Admin, UserRole.Inventory]) && (
            <>
                <NavLink to="/products">📦 Produtos</NavLink>
                <NavLink to="/suppliers">🚚 Fornecedores</NavLink>
            </>
        )}

        {/* Links de Transações/Relatórios (Admin/Sales) */}
        {isAllowed([UserRole.Admin, UserRole.Sales]) && (
             <>
                <NavLink to="/sales">📈 Vendas</NavLink>
                <NavLink to="/reports">📊 Relatórios</NavLink>
             </>
        )}

        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <LogoutButton onClick={logout}>Sair (Logout)</LogoutButton>
        </div>
      </Sidebar>
      <MainContent>
        <Header>
            <h1>{user ? `Bem-vindo, ${user.username}!` : 'Carregando...'}</h1>
        </Header>
        {/* O Outlet renderiza o conteúdo da rota filha */}
        <Outlet /> 
      </MainContent>
    </LayoutContainer>
  );
};

export default AppLayout;