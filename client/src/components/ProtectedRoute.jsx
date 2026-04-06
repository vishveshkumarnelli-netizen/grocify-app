import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../context/store'

export default function ProtectedRoute() {
  const { user } = useAuthStore()
  const location = useLocation()
  if (!user) return <Navigate to={`/login?redirect=${location.pathname}`} replace />
  return <Outlet />
}
