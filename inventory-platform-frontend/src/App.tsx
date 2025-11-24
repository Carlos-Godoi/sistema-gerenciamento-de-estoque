import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../inventory-platform-backend/src/models/User';
import { useAuth } from './context/AuthContext';
import LoginScreen from './pages/LoginScreen';
import Dashboard from '../src/pages/Dashboard';
//import ProductList from './pages/ProductList';


// ------------------------------------------------------------------
// 1. Componente Avançado: Rota Privada (Proteção por Autenticação/Role)
// ------------------------------------------------------------------
interface PrivateRouteProps {
  allowedRoles?: UserRole[]; // Roles que podem acessar esta rota
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
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Autenticado e autorizado. Permitir o acesso
  return <Outlet />; // Renderiza a rota filha
};

//----------------------------------------------------------------------

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginScreen />} />

        {/* Rota Privada: Base */}
        <Route element={<PrivateRoute />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/dashboad' element={<Dashboard />} />
          {/* Exemplo de rotas que exigem uma role específica:
            * O CRUD completo exige Admin ou Inventory.
            * A visualização pode ser aberta a todos (apenas Protect). 
            */}
          <Route element={<PrivateRoute allowedRoles={[UserRole.Admin, UserRole.Inventory]} />}>
            <Route path='/products' element={<ProductList />} />
            {/* <Route path='/products/new' element={<ProductForm />} /> */}
            {/* <Route path='/suppliers' element={<SuppliersList />} /> */}
          </Route>

          {/* Rotas de Vendas (Admin e Sales) */}
          {/* <Route element={<PrivateRoute allowedRoles={[UserRole.Admin, UserRole.Sales]} />}>
          <Route path='/sales' element={<SaleList />} />
          <Route path='/reports' element={<ReportScreen />} /> 
          </Route> */}
        </Route>

            {/* Rota 404 */}
            <Route path='*' element={<h1>404 = Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;