import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdminStore } from './context/store'
import AdminLayout  from './components/layout/AdminLayout'
import LoginPage    from './pages/LoginPage'
import Dashboard    from './pages/Dashboard'
import ProductsPage from './pages/ProductsPage'
import ProductForm  from './pages/ProductForm'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage   from './pages/OrdersPage'
import OrderDetail  from './pages/OrderDetail'
import CustomersPage from './pages/CustomersPage'
import SettingsPage from './pages/SettingsPage'

function RequireAdmin({ children }) {
  const { admin } = useAdminStore()
  if (!admin) return <Navigate to="/login" replace />
  if (admin.role !== 'admin') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <RequireAdmin><AdminLayout /></RequireAdmin>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"           element={<Dashboard />} />
        <Route path="products"            element={<ProductsPage />} />
        <Route path="products/new"        element={<ProductForm />} />
        <Route path="products/edit/:id"   element={<ProductForm />} />
        <Route path="categories"          element={<CategoriesPage />} />
        <Route path="orders"              element={<OrdersPage />} />
        <Route path="orders/:id"          element={<OrderDetail />} />
        <Route path="customers"           element={<CustomersPage />} />
        <Route path="settings"            element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
