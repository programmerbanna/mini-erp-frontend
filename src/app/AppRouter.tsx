import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProductsPage from '@/features/products/ProductsPage';
import CreateSalePage from '@/features/sales/CreateSalePage';
import UsersPage from '@/features/users/UsersPage';
import RolesPage from '@/features/roles/RolesPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredPermission="dashboard:read" />
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>
            <Route path="/products" element={<ProtectedRoute requiredPermission="product:read" />}>
              <Route index element={<ProductsPage />} />
            </Route>
            <Route path="/sales" element={<ProtectedRoute requiredPermission="sale:create" />}>
              <Route index element={<CreateSalePage />} />
            </Route>
            <Route path="/users" element={<ProtectedRoute requiredPermission="user:manage" />}>
              <Route index element={<UsersPage />} />
            </Route>
            <Route path="/roles" element={<ProtectedRoute requiredPermission="role:manage" />}>
              <Route index element={<RolesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
