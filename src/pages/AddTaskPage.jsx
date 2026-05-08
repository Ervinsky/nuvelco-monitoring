import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, Button, Toast } from '../components/shadcn/index.js'
import TaskForm from '../components/TaskForm'
import { taskService } from '../services/supabase'
import { ArrowLeft } from 'lucide-react'

const AddTaskPage = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  const handleCreateTask = async (formData, assignedUserIds) => {
    try {
      await taskService.create({ ...formData, created_by: profile.id }, assignedUserIds)
      setToast({ message: 'Task created successfully! Redirecting to schedule...', type: 'success' })
      setTimeout(() => navigate('/schedule'), 1500)
    } catch (err) {
      setToast({ message: 'Failed to create task: ' + err.message, type: 'error' })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/schedule')} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Task</h1>
          <p className="text-gray-400 mt-1">Create a new task and assign it to a lineman</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TaskForm onSubmit={handleCreateTask} onCancel={() => navigate('/schedule')} />
        </CardContent>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default AddTaskPage
