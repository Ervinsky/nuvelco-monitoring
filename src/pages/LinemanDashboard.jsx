import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { taskService } from '../services/supabase'
import { Card, CardContent, Badge, Button, Toast } from '../components/shadcn/index.js'
import { MapPin, Clock, Calendar, Route, MessageSquare, Send, FileText } from 'lucide-react'
import { format } from 'date-fns'

const LinemanDashboard = () => {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [remark, setRemark] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  }

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAssignedToUser(profile.id)
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch assigned tasks:', err)
      setToast({ message: 'Failed to load tasks', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    const ch = taskService.subscribeToTasks(() => fetchTasks())
    return () => ch.unsubscribe()
  }, [profile.id])

  const updateStatus = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus })
      setToast({ message: `Status updated to ${newStatus}`, type: 'success' })
      fetchTasks()
      if (selectedTask?.id === taskId) {
        taskService.getById(taskId).then(setSelectedTask)
      }
    } catch (err) {
      setToast({ message: 'Failed to update status: ' + err.message, type: 'error' })
    }
  }

  const addRemark = async () => {
    if (!remark.trim() || !selectedTask) return
    try {
      await taskService.addRemark(selectedTask.id, profile.id, remark)
      setRemark('')
      taskService.getById(selectedTask.id).then(setSelectedTask)
      setToast({ message: 'Remark added', type: 'success' })
    } catch (err) {
      setToast({ message: 'Failed to add remark: ' + err.message, type: 'error' })
    }
  }

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'Pending') return 'In Progress'
    if (currentStatus === 'In Progress') return 'Completed'
    return null
  }

  const filteredTasks = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .anim-fade-up { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-white anim-fade-up">
          {getGreeting()}, <span className="text-emerald-400">{profile?.name || 'Lineman'}</span>
        </h1>
        <p className="text-gray-400 mt-1">Your assigned tasks and schedule</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          {tasks.length === 0 ? (
            <Card className="p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p className="text-lg font-medium">No tasks assigned yet</p>
              <p className="text-sm mt-2">Tasks assigned to you by the admin will appear here</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card className="p-8 text-center text-gray-400">
                  <p>No tasks with this status</p>
                </Card>
              ) : (
                filteredTasks.map(task => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{task.title}</h3>
                          <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}>{task.priority}</Badge>
                          <Badge variant={task.status === 'Pending' ? 'warning' : task.status === 'In Progress' ? 'primary' : 'success'}>{task.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{task.barangay}</span>
                          <span className="flex items-center gap-1"><Route className="w-4 h-4" />{task.street || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{task.schedule_date ? format(new Date(task.schedule_date), 'MMM dd, yyyy') : 'N/A'}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.schedule_date ? format(new Date(task.schedule_date), 'HH:mm') : ''}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {getNextStatus(task.status) && (
                          <Button size="sm" onClick={() => updateStatus(task.id, getNextStatus(task.status))}>
                            Mark as {getNextStatus(task.status)}
                          </Button>
                        )}
                        {task.status === 'Completed' && (
                          <Badge variant="success" className="px-3 py-1">Completed</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

export default LinemanDashboard
