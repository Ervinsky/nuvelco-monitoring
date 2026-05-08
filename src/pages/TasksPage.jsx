import { useState, useEffect } from 'react'
import { taskService } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Toast } from '../components/shadcn/index.js'
import TaskForm from '../components/TaskForm'
import { MapPin, Clock, Calendar, FileText, Edit, Trash2, MessageSquare, Send, CheckCircle, Route, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

const TasksPage = () => {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [remark, setRemark] = useState('')
  const [toast, setToast] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null, loading: false })
  const isAdmin = profile?.role === 'admin'

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setToast({ message: 'Failed to load tasks: ' + err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    const ch = taskService.subscribeToTasks(() => { fetchTasks(); if (selectedTask) taskService.getById(selectedTask.id).then(setSelectedTask).catch(() => setSelectedTask(null)) })
    return () => ch.unsubscribe()
  }, [selectedTask])

  const confirmDelete = (task) => {
    setDeleteDialog({ open: true, task, loading: false })
  }

  const handleDelete = async () => {
    if (!deleteDialog.task) return
    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await taskService.delete(deleteDialog.task.id)
      setToast({ message: 'Task deleted successfully', type: 'success' })
      if (selectedTask?.id === deleteDialog.task.id) setSelectedTask(null)
      fetchTasks()
    } catch (err) {
      setToast({ message: 'Failed to delete task: ' + err.message, type: 'error' })
    } finally {
      setDeleteDialog({ open: false, task: null, loading: false })
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Assign Lineman</h1>
        <p className="text-gray-400 mt-1">View and manage all scheduled tasks</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {tasks.length === 0 ? (
              <Card className="p-12 text-center text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3" /><p>No tasks available</p></Card>
            ) : tasks.map(task => (
              <Card key={task.id} className={`p-4 cursor-pointer transition-all hover:bg-gray-800/50 ${selectedTask?.id === task.id ? 'ring-2 ring-emerald-500' : ''}`}
                onClick={() => taskService.getById(task.id).then(setSelectedTask)}>
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
                    {task.task_assignments?.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-gray-500">Assigned:</span>
                        <div className="flex flex-wrap gap-1">{task.task_assignments.map(a => <Badge key={a.user_id} variant="info">{a.users?.name}</Badge>)}</div>
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setShowEdit(true) }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); confirmDelete(task) }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            {selectedTask ? (
              <Card className="sticky top-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Task Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white">{selectedTask.title}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={selectedTask.priority === 'High' ? 'danger' : selectedTask.priority === 'Medium' ? 'warning' : 'success'}>{selectedTask.priority}</Badge>
                        <Badge variant={selectedTask.status === 'Pending' ? 'warning' : selectedTask.status === 'In Progress' ? 'primary' : 'success'}>{selectedTask.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{selectedTask.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400"><MapPin className="w-4 h-4" /><span>{selectedTask.barangay}</span></div>
                      <div className="flex items-center gap-2 text-gray-400"><Route className="w-4 h-4" /><span>{selectedTask.street || 'N/A'}</span></div>
                      <div className="flex items-center gap-2 text-gray-400"><Calendar className="w-4 h-4" /><span>{selectedTask.schedule_date ? format(new Date(selectedTask.schedule_date), 'MMMM dd, yyyy') : 'N/A'}</span></div>
                    </div>
                    {selectedTask.task_assignments?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Assigned Linemen</p>
                        <div className="flex flex-wrap gap-2">{selectedTask.task_assignments.map(a => (
                          <div key={a.user_id} className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-medium">{a.users?.name?.charAt(0)}</div>
                            <span className="text-sm text-gray-300">{a.users?.name}</span>
                          </div>
                        ))}</div>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" />Remarks & Reports</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                        {selectedTask.remarks?.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No remarks yet</p>
                          : selectedTask.remarks?.map(r => (
                            <div key={r.id} className="bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-300">{r.users?.name}</span>
                                <span className="text-xs text-gray-500">{format(new Date(r.created_at), 'MMM dd, HH:mm')}</span>
                              </div>
                              <p className="text-sm text-gray-400">{r.message}</p>
                            </div>
                          ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={remark} onChange={e => setRemark(e.target.value)} placeholder="Add a remark..."
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          onKeyDown={e => e.key === 'Enter' && addRemark()} />
                        <Button size="icon" onClick={addRemark} disabled={!remark.trim()}><Send className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 text-center text-gray-400 sticky top-6"><CheckCircle className="w-12 h-12 mx-auto mb-3" /><p>Select a task to view details</p></Card>
            )}
          </div>
        </div>
      )}

      <Dialog open={showEdit} onOpenChange={(v) => { if (!v) setShowEdit(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <TaskForm task={selectedTask} onSubmit={async (fd, ids) => {
            try {
              await taskService.update(selectedTask.id, fd)
              await taskService.updateAssignments(selectedTask.id, ids)
              setShowEdit(false)
              setToast({ message: 'Task updated successfully', type: 'success' })
              fetchTasks()
            } catch (err) {
              setToast({ message: 'Failed to update task: ' + err.message, type: 'error' })
            }
          }} onCancel={() => setShowEdit(false)} />
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

export default TasksPage
