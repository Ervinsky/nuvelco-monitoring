import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import LinemanDashboard from './pages/LinemanDashboard'
import SchedulePage from './pages/SchedulePage'
import TasksPage from './pages/TasksPage'
import AddTaskPage from './pages/AddTaskPage'
import UsersPage from './pages/UsersPage'

const DashboardRedirect = () => {
  const { profile } = useAuth()
  if (profile?.role === 'admin') return <AdminDashboard />
  return <LinemanDashboard />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute allowedRoles={['admin']}><TasksPage /></ProtectedRoute>} />
          <Route path="/add-task" element={<ProtectedRoute allowedRoles={['admin']}><AddTaskPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
