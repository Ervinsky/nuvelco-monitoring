import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Spinner } from '../components/ui'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <img src="/logo-nuv.png" alt="NUVELCO" className="w-14 h-14 object-contain" />
        </div>
        <p className="text-white text-lg font-medium">Loading...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait while we prepare your dashboard</p>
      </div>
    )
  }

  const isAuthenticated = user || import.meta.env.DEV

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

export default ProtectedRoute
