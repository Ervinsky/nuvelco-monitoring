import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardService, taskService } from '../services/supabase'
import { Card, CardContent, Badge, Toast } from '../components/shadcn/index.js'
import { MapPin, Clock, Calendar, Route, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { format } from 'date-fns'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening' }

  const fetchData = async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        dashboardService.getStats(),
        taskService.getAll(),
      ])
      setStats(statsData)
      setRecentTasks(Array.isArray(tasksData) ? tasksData.slice(0, 5) : [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setToast({ message: 'Failed to load dashboard data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const ch = taskService.subscribeToTasks(() => fetchData())
    return () => ch.unsubscribe()
  }, [])

  return (
    <>
      <style>{`
        @keyframes bounceIn { 0% { transform: translateY(-30px); opacity: 0; } 50% { transform: translateY(10px); } 70% { transform: translateY(-5px); } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes fadeInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse-glow { 0%, 100% { text-shadow: 0 0 20px rgba(52, 211, 153, 0.3); } 50% { text-shadow: 0 0 40px rgba(52, 211, 153, 0.6), 0 0 60px rgba(52, 211, 153, 0.3); } }
        .anim-bounce-in { animation: bounceIn 0.8s ease-out forwards; }
        .anim-shimmer { background: linear-gradient(90deg, #34d399 0%, #6ee7b7 25%, #34d399 50%, #6ee7b7 75%, #34d399 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .anim-fade-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .anim-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* Greeting */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-white anim-bounce-in">
          {getGreeting()}, <span className="text-emerald-400">{profile?.name || 'Admin'}</span>
        </h1>
        <p className="text-gray-400 mt-1">NUVELCO Scheduled Monitoring Management System</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : (
        <div className="px-6 pb-6 space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                  <p className="text-xs text-gray-400">Total Tasks</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.pending || 0}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.completed || 0}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.total_linemen || 0}</p>
                  <p className="text-xs text-gray-400">Linemen</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent tasks */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Tasks</h2>
            {recentTasks.length === 0 ? (
              <Card className="p-12 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <p>No tasks yet. Create your first task to get started.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentTasks.map(task => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{task.title}</h3>
                          <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}>{task.priority}</Badge>
                          <Badge variant={task.status === 'Pending' ? 'warning' : task.status === 'In Progress' ? 'primary' : 'success'}>{task.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-1">{task.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{task.barangay}</span>
                          <span className="flex items-center gap-1"><Route className="w-4 h-4" />{task.street || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{task.schedule_date ? format(new Date(task.schedule_date), 'MMM dd, yyyy') : 'N/A'}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.schedule_date ? format(new Date(task.schedule_date), 'HH:mm') : ''}</span>
                        </div>
                        {task.task_assignments?.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">Assigned:</span>
                            <div className="flex flex-wrap gap-1">{task.task_assignments.map(a => <Badge key={a.user_id} variant="info">{a.users?.name}</Badge>)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

export default AdminDashboard
