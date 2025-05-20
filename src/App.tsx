import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './hooks/api';
import { Login } from './components/login/Login';
import { Register } from './components/register/Register';
import { PrivateRoute } from './components/shared/PrivateRoute';
import Home from './components/home/Home';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import NotFound from './components/shared/NotFound';
import ObrasPage from './components/obras/ObrasPage';
import ObraDetalle from './components/obras/ObraDetalle';
import AreaDetallePage from './components/areas/AreaDetallesPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas privadas */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              {/* Rutas hijas del layout */}
              <Route index element={<Home />} />
              <Route path="obras" element={<ObrasPage />} />

              {/* Rutas de obra y sus subrecursos */}
              <Route path="obras/:id" element={<ObraDetalle />} />
              <Route path="obras/:id/supervisores" element={<ObraDetalle />} />
              <Route path="obras/:id/reportes" element={<ObraDetalle />} />
              <Route path="obras/:id/estadisticas" element={<ObraDetalle />} />
              <Route path="areas/:areaId" element={<AreaDetallePage />} />
              {/* Aquí puedes agregar más rutas hijas */}
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </QueryClientProvider>
  )
}
export default App;