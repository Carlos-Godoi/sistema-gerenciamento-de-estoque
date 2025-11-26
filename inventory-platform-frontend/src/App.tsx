import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../inventory-platform-backend/src/models/User';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LoginScreen from './pages/LoginScreen';
import Dashboard from '../src/pages/Dashboard';
import ProductList from './pages/ProductList';

// ... (O Componente PrivateRoute é mantido como está, pois está correto)
interface PrivateRouteProps {
  allowedRoles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Não autenticado = Redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Autenticado, mas não tem a role permitida
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redireciona para o Dashboard ou mostrar uma mensagem (Acesso Negado)
    // Usamos o '/' em vez de '/dashboard' para ser mais genérico
    return <Navigate to="/" replace />; 
  }

  // 3. Autenticado e autorizado. Permitir o acesso
  return <Outlet />;
};
// ------------------------------------------------------------------

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path='/login' element={<LoginScreen />} />

        {/* 🎯 Rota Principal do Layout (Privada) */}
        {/* O AppLayout tem um <Outlet /> para renderizar as rotas filhas. */}
        
        {/* Etapa 1: Proteção de Rota (Autenticação básica) */}
        <Route element={<PrivateRoute />}>
          
          {/* Etapa 2: Layout Principal (AppLayout) */}
          <Route path='/' element={<AppLayout />}>
            
            {/* Rotas Filhas do AppLayout (renderizadas no seu <Outlet />) */}
            
            {/* Rota Home/Dashboard (path: '/') */}
            <Route index element={<Dashboard />} /> 
            
            {/* Rotas de Gerenciamento (Admin/Inventory) - Proteção de Papel */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.Admin, UserRole.Inventory]} />}>
              <Route path='products' element={<ProductList />} />
              <Route path='suppliers' element={<p>Lista de Fornecedores (Em breve)</p>} />
            </Route>

            {/* Rotas de Vendas/Relatórios (Admin e Sales) - Proteção de Papel */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.Admin, UserRole.Sales]} />}>
              <Route path='sales' element={<p>Lista de vendas</p>} />
              <Route path='reports' element={<p>Tela de Relatórios</p>} />
            </Route>
          
          </Route> {/* Fim do AppLayout */}
        
        </Route> {/* Fim da PrivateRoute */}
        
        {/* 🎯 Rota 404 (Sempre por último e DENTRO de <Routes>) */}
        <Route path='*' element={<h1>404 = Página não encontrada</h1>} />
      </Routes>

    </BrowserRouter >
  );
};

export default App;