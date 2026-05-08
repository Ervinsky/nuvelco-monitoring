import { useState, useEffect, useCallback } from 'react'
import { taskService } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Toast } from '../components/shadcn/index.js'
import TaskForm from '../components/TaskForm'
import { Plus, Search, Filter, Calendar as CalendarIcon, Table2, MapPin, Clock, Edit, Trash2, ChevronLeft, ChevronRight, Route, AlertTriangle, FileText } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

const SchedulePage = () => {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('table')
  const [toast, setToast] = useState(null)
  const [filters, setFilters] = useState({ barangay: '', date: '', status: '', search: '' })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null, loading: false })

  const isAdmin = profile?.role === 'admin'

  const fetchTasks = useCallback(async () => {
    try {
      let data
      if (isAdmin) {
        data = await taskService.getAll()
      } else {
        data = await taskService.getAssignedToUser(profile.id)
      }
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setToast({ message: 'Failed to load tasks: ' + err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [isAdmin, profile.id])

  useEffect(() => {
    fetchTasks()
    const ch = taskService.subscribeToTasks(() => fetchTasks())
    return () => ch.unsubscribe()
  }, [fetchTasks])

  const handleCreate = async (fd, ids) => {
    try {
      await taskService.create({ ...fd, created_by: profile.id }, ids)
      setShowModal(false)
      setEditingTask(null)
      setToast({ message: 'Task created successfully', type: 'success' })
      fetchTasks()
    } catch (err) {
      setToast({ message: 'Failed to create task: ' + err.message, type: 'error' })
    }
  }

  const handleUpdate = async (fd, ids) => {
    try {
      await taskService.update(editingTask.id, fd)
      await taskService.updateAssignments(editingTask.id, ids)
      setEditingTask(null)
      setShowModal(false)
      setToast({ message: 'Task updated successfully', type: 'success' })
      fetchTasks()
    } catch (err) {
      setToast({ message: 'Failed to update task: ' + err.message, type: 'error' })
    }
  }

  const confirmDelete = (task) => {
    setDeleteDialog({ open: true, task, loading: false })
  }

  const updateStatus = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus })
      setToast({ message: `Task marked as ${newStatus}`, type: 'success' })
      fetchTasks()
    } catch (err) {
      setToast({ message: 'Failed to update status: ' + err.message, type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.task) return
    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await taskService.delete(deleteDialog.task.id)
      setToast({ message: 'Task deleted successfully', type: 'success' })
      fetchTasks()
    } catch (err) {
      setToast({ message: 'Failed to delete task: ' + err.message, type: 'error' })
    } finally {
      setDeleteDialog({ open: false, task: null, loading: false })
    }
  }

  const filtered = tasks.filter(t => {
    if (filters.barangay && t.barangay !== filters.barangay) return false
    if (filters.date && !t.schedule_date?.startsWith(filters.date)) return false
    if (filters.status && t.status !== filters.status) return false
    if (filters.search) {
      const s = filters.search.toLowerCase()
      const assignedNames = t.task_assignments?.map(a => a.users?.name).filter(Boolean).join(' ').toLowerCase() || ''
      return t.title?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s) || t.barangay?.toLowerCase().includes(s) || t.street?.toLowerCase().includes(s) || assignedNames.includes(s)
    }
    return true
  })

  const allBarangays = [...new Set(tasks.map(t => t.barangay).filter(Boolean))]

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{isAdmin ? 'Schedule' : 'Assigned Tasks'}</h1>
          <p className="text-gray-400 mt-1">{isAdmin ? 'Manage and schedule field tasks' : 'Tasks assigned to you'}</p>
        </div>
        {isAdmin && <Button onClick={() => { setEditingTask(null); setShowModal(true) }}><Plus className="w-4 h-4" />New Task</Button>}
      </div>

      {/* Filters & Table - Admin only */}
      {isAdmin && (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Search title, barangay, lineman..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <select value={filters.barangay} onChange={e => setFilters({ ...filters, barangay: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">All Barangays</option>
                  {allBarangays.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setViewMode('table')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${viewMode === 'table' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-600 hover:bg-gray-800 text-gray-400'}`}>
                    <Table2 className="w-4 h-4" /> Table
                  </button>
                  <button onClick={() => setViewMode('calendar')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${viewMode === 'calendar' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-600 hover:bg-gray-800 text-gray-400'}`}>
                    <CalendarIcon className="w-4 h-4" /> Calendar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          {viewMode === 'table' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Barangay</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Street</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Date & Time</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Priority</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Assigned</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="8" className="py-12 text-center text-gray-400">{loading ? 'Loading...' : 'No tasks found'}</td></tr>
                    ) : filtered.map(task => (
                      <tr key={task.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-white">{task.title}</p>
                          {task.description && <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>}
                        </td>
                        <td className="py-3 px-4"><span className="flex items-center gap-1 text-sm text-gray-300"><MapPin className="w-3.5 h-3.5" />{task.barangay}</span></td>
                        <td className="py-3 px-4"><span className="flex items-center gap-1 text-sm text-gray-300"><Route className="w-3.5 h-3.5" />{task.street || 'N/A'}</span></td>
                        <td className="py-3 px-4"><span className="flex items-center gap-1 text-sm text-gray-300"><Clock className="w-3.5 h-3.5" />{task.schedule_date ? format(new Date(task.schedule_date), 'MMM dd, yyyy HH:mm') : 'N/A'}</span></td>
                        <td className="py-3 px-4"><Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}>{task.priority}</Badge></td>
                        <td className="py-3 px-4"><Badge variant={task.status === 'Pending' ? 'warning' : task.status === 'In Progress' ? 'primary' : 'success'}>{task.status}</Badge></td>
                        <td className="py-3 px-4"><div className="flex flex-wrap gap-1">{task.task_assignments?.map(a => <Badge key={a.user_id} variant="info">{a.users?.name}</Badge>)}</div></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingTask(task); setShowModal(true) }}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(task)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {viewMode === 'calendar' && <CalendarView tasks={filtered} />}
        </>
      )}

      {/* Lineman assigned tasks - card view only */}
      {!isAdmin && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-16 text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tasks assigned yet</p>
              <p className="text-sm mt-2">Wait for the admin to assign you a task</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map(task => (
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
                      {task.status === 'Pending' && (
                        <Button size="sm" onClick={() => updateStatus(task.id, 'In Progress')}>
                          Start Task
                        </Button>
                      )}
                      {task.status === 'In Progress' && (
                        <Button size="sm" onClick={() => updateStatus(task.id, 'Completed')}>
                          Complete
                        </Button>
                      )}
                      {task.status === 'Completed' && (
                        <Badge variant="success" className="px-3 py-1">Done</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog open={showModal} onOpenChange={(v) => { if (!v) { setShowModal(false); setEditingTask(null) } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle></DialogHeader>
          <TaskForm task={editingTask} onSubmit={editingTask ? handleUpdate : handleCreate} onCancel={() => { setShowModal(false); setEditingTask(null) }} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(v) => { if (!v && !deleteDialog.loading) setDeleteDialog({ open: false, task: null, loading: false }) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">Delete Task</DialogTitle>
                <p className="text-sm text-gray-400 mt-1">This action cannot be undone.</p>
              </div>
            </div>
          </DialogHeader>
          {deleteDialog.task && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <p className="font-medium text-white">{deleteDialog.task.title}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                <span>{deleteDialog.task.barangay}</span>
                {deleteDialog.task.schedule_date && <span>{format(new Date(deleteDialog.task.schedule_date), 'MMM dd, yyyy')}</span>}
                <Badge variant={deleteDialog.task.status === 'Pending' ? 'warning' : deleteDialog.task.status === 'In Progress' ? 'primary' : 'success'}>{deleteDialog.task.status}</Badge>
              </div>
              {deleteDialog.task.task_assignments?.length > 0 && (
                <p className="text-sm text-gray-400">Assigned to: {deleteDialog.task.task_assignments.map(a => a.users?.name).filter(Boolean).join(', ')}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, task: null, loading: false })} disabled={deleteDialog.loading}>Cancel</Button>
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleDelete} disabled={deleteDialog.loading}>
              {deleteDialog.loading ? 'Deleting...' : 'Delete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

const CalendarView = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) })
  const startDay = startOfMonth(currentDate).getDay()
  const prevDays = Array.from({ length: startDay }, (_, i) => { const d = new Date(startOfMonth(currentDate)); d.setDate(d.getDate() - (startDay - i)); return d })

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
          <h3 className="text-lg font-semibold text-white">{format(currentDate, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-700 border border-gray-700 rounded-lg overflow-hidden">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="bg-gray-800 py-2 text-center text-xs font-semibold text-gray-400">{d}</div>)}
          {prevDays.map((d, i) => <div key={`p${i}`} className="bg-gray-800/50 min-h-[80px] p-2"><span className="text-xs text-gray-600">{format(d, 'd')}</span></div>)}
          {days.map((d, i) => {
            const dayTasks = tasks.filter(t => t.schedule_date && isSameDay(new Date(t.schedule_date), d))
            const isToday = isSameDay(d, new Date())
            return (
              <div key={i} className={`bg-gray-800 min-h-[80px] p-2 ${isToday ? 'bg-emerald-900/30' : ''}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-emerald-400' : 'text-gray-300'}`}>{format(d, 'd')}</span>
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 3).map(t => <div key={t.id} className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Pending' ? 'bg-amber-400' : t.status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`} /><span className="text-xs text-gray-400 truncate">{t.title}</span></div>)}
                  {dayTasks.length > 3 && <span className="text-xs text-gray-500">+{dayTasks.length - 3}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default SchedulePage
