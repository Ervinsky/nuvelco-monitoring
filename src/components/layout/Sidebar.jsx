import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  UserCheck,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'
import ProfileModal from '../ProfileModal'

const Sidebar = ({ onCollapseChange }) => {
  const { profile, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleCollapse = (newState) => {
    setCollapsed(newState)
    onCollapseChange?.(newState)
  }

  const isAdmin = profile?.role === 'admin'

  const navItems = isAdmin
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/add-task', label: 'Add Task', icon: Plus },
        { path: '/schedule', label: 'Schedule', icon: CalendarDays },
        { path: '/tasks', label: 'Assign Lineman', icon: UserCheck },
        { path: '/users', label: 'Users', icon: Users },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/schedule', label: 'Assign Task', icon: UserCheck },
      ]

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await logout()
    } finally {
      setLogoutLoading(false)
      setShowLogoutDialog(false)
    }
  }

  return (
    <>
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 flex flex-col bg-[#0f1729] text-white ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b border-gray-700/50 bg-emerald-600 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden bg-white cursor-pointer" onClick={() => setShowProfile(true)}>
          <img src="/logo-nuv.png" alt="NUVELCO" className="w-8 h-8 object-contain" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden cursor-pointer" onClick={() => setShowProfile(true)}>
            <h1 className="font-bold text-sm whitespace-nowrap">NUVELCO</h1>
            <p className="text-[10px] whitespace-nowrap text-white/80">Nueva Vizcaya Electric Cooperative</p>
          </div>
        )}
      </div>

      {/* Menu Label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">Main Menu</span>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-3 space-y-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              {!collapsed && <span className="text-base font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse */}
      <div className="p-4 border-t border-gray-700/50">
        <button onClick={() => handleCollapse(!collapsed)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>

      {/* User & Logout */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile?.name || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role || 'User'}</p>
            </div>
          </div>
          <button onClick={() => setShowLogoutDialog(true)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </aside>

    {/* Logout Confirmation Dialog */}
    {showLogoutDialog && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60" onClick={() => !logoutLoading && setShowLogoutDialog(false)} />
        <div className="relative z-50 w-full max-w-sm mx-4 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
              <p className="text-sm text-gray-400">Are you sure you want to logout?</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowLogoutDialog(false)}
              disabled={logoutLoading}
              className="px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="px-4 py-2 bg-red-600 rounded-lg text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {logoutLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}

export default Sidebar
