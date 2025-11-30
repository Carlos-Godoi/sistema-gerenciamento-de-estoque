import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../inventory-platform-backend/src/models/User';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LoginScreen from './pages/LoginScreen';
import Dashboard from '../src/pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import SupplierList from './pages/SupplierList';
import SupplierForm from './pages/SupplierForm';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';

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
        <Route path="/login" element={<LoginScreen />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Rotas de Gerenciamento (Admin/Inventory) */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.Admin, UserRole.Inventory]} />}>
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />

              {/* Rotas de Gerenciamento de Usuários (APENAS ADMIN) */}
              <Route element={<PrivateRoute allowedRoles={[UserRole.Admin]} />}>
                <Route path="users" element={<UserList />} />
                <Route path="users/new" element={<UserForm />} />
                <Route path="users/edit/:id" element={<UserForm />} />
              </Route>

              {/* Fornecedores (Suppliers) - NOVO */}
              <Route path="suppliers" element={<SupplierList />} />
              <Route path="suppliers/new" element={<SupplierForm />} />
              <Route path="suppliers/edit/:id" element={<SupplierForm />} />
            </Route>

            {/* ... (Rotas de Vendas/Relatórios existentes) */}
          </Route>
        </Route>

        <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;