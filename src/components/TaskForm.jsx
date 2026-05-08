import { useState, useEffect } from 'react'
import { Button, Input, Textarea, Select, SelectItem, Checkbox } from './shadcn'
import { userService } from '../services/supabase'
import { Search, X } from 'lucide-react'

const solanoBarangays = [
  'Aggub', 'Bagahabag', 'Zone 6', 'Bangar', 'Bascaran', 'Communal',
  'Concepcion (Calalabangan)', 'Curifang (Sinafal)', 'Dadap', 'Lactawan',
  "Osmeña", 'Pilar D. Galima', 'Poblacion North', 'Poblacion South',
  'Quezon', 'Quirino', 'Roxas', 'San Juan', 'San Luis', 'Tucal', 'Uddiawan', 'Wacal',
]

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [linemen, setLinemen] = useState([])
  const [formData, setFormData] = useState({
    title: '', description: '', barangay: solanoBarangays[0],
    schedule_date: '', priority: 'Medium', status: 'Pending',
  })
  const [selectedLinemen, setSelectedLinemen] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { userService.getLinemen().then(data => setLinemen(data || [])) }, [])

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '', description: task.description || '',
        barangay: task.barangay || solanoBarangays[0],
        schedule_date: task.schedule_date ? task.schedule_date.slice(0, 16) : '',
        priority: task.priority || 'Medium', status: task.status || 'Pending',
      })
      if (task.task_assignments) setSelectedLinemen(task.task_assignments.map(a => a.user_id))
    }
  }, [task])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    if (!formData.description.trim()) return
    if (!formData.schedule_date) return
    setLoading(true)
    try {
      await onSubmit({ ...formData }, selectedLinemen)
    } finally { setLoading(false) }
  }

  const toggleLineman = (userId) => {
    setSelectedLinemen(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
  }

  const clearSearch = () => setSearchQuery('')

  const filteredLinemen = linemen.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedNames = selectedLinemen.map(id => {
    const l = linemen.find(u => u.id === id)
    return l ? l.name : 'Unknown'
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Task Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Line Repair at Barangay Aggub" required />
      <Textarea label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the task details..." rows={3} required />

      <Select label="Barangay (Solano)" value={formData.barangay} onChange={e => setFormData({ ...formData, barangay: e.target.value })}>
        {solanoBarangays.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </Select>
        <Input label="Calendar" type="datetime-local" value={formData.schedule_date} onChange={e => setFormData({ ...formData, schedule_date: e.target.value })} required />
      </div>

      {task && (
        <Select label="Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </Select>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Assign Linemen</label>

        {selectedNames.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-400 mb-1">Selected:</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedNames.map((name, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
                  {name}
                  <button type="button" onClick={() => toggleLineman(selectedLinemen[idx])} className="hover:text-emerald-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lineman by name..."
            className="w-full pl-9 pr-8 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-40 overflow-y-auto border border-gray-600 rounded-lg p-3 space-y-2 bg-gray-800/50">
          {filteredLinemen.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              {linemen.length === 0 ? 'No linemen available' : 'No matching linemen found'}
            </p>
          ) : (
            filteredLinemen.map(lineman => (
              <Checkbox key={lineman.id} label={lineman.name} checked={selectedLinemen.includes(lineman.id)} onChange={() => toggleLineman(lineman.id)} />
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}</Button>
      </div>
    </form>
  )
}

export default TaskForm
