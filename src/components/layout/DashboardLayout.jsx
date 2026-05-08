import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import ProfileModal from '../ProfileModal'

const DashboardLayout = ({ children }) => {
  const { profile } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
    <div className={`min-h-screen ${darkMode ? 'bg-[#0f1729]' : 'bg-gray-100'}`}>
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className="min-h-screen transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}>
        {/* Top Bar */}
        <div className={`sticky top-0 z-30 flex items-center justify-end px-6 py-3 border-b ${darkMode ? 'bg-[#1a2744] border-gray-700/50' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-amber-400 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 rounded-lg px-3 py-2 transition-colors">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white text-sm font-medium">{profile?.name || 'User'}</p>
                <p className="text-gray-400 text-xs capitalize">{profile?.role === 'admin' ? 'Administrator' : 'Lineman'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="min-h-[calc(100vh-57px)]">
          {children}
        </div>
      </div>
    </div>

    <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}

export default DashboardLayout
