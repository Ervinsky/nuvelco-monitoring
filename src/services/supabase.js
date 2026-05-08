import { supabase } from '../lib/supabase'

const isDev = import.meta.env.DEV
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

// In-memory storage for dev mode
let devTasks = []
let devTaskAssignments = []
let devRemarks = []
let devUsers = [
  { id: DEV_USER_ID, name: 'Dev Admin', role: 'admin', created_at: new Date().toISOString() },
]

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const taskService = {
  getAll: async () => {
    if (isDev) {
      return devTasks.map(task => {
        const assignments = devTaskAssignments
          .filter(a => a.task_id === task.id)
          .map(a => {
            const user = devUsers.find(u => u.id === a.user_id)
            return { user_id: a.user_id, users: user || null }
          })
        const remarks = devRemarks
          .filter(r => r.task_id === task.id)
          .map(r => {
            const user = devUsers.find(u => u.id === r.user_id)
            return { ...r, users: user ? { name: user.name } : null }
          })
        return { ...task, task_assignments: assignments, remarks }
      }).sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date))
    }

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments (
          user_id,
          users (id, name, role)
        ),
        remarks (
          id,
          user_id,
          message,
          created_at,
          users (name)
        )
      `)
      .order('schedule_date', { ascending: true })
    if (error) throw error
    return data
  },

  getById: async (id) => {
    if (isDev) {
      const task = devTasks.find(t => t.id === id)
      if (!task) throw new Error('Task not found')
      const assignments = devTaskAssignments
        .filter(a => a.task_id === task.id)
        .map(a => {
          const user = devUsers.find(u => u.id === a.user_id)
          return { user_id: a.user_id, users: user || null }
        })
      const remarks = devRemarks
        .filter(r => r.task_id === task.id)
        .map(r => {
          const user = devUsers.find(u => u.id === r.user_id)
          return { ...r, users: user ? { name: user.name } : null }
        })
      return { ...task, task_assignments: assignments, remarks }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments (
          user_id,
          users (id, name, role)
        ),
        remarks (
          id,
          user_id,
          message,
          created_at,
          users (name)
        )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (task, assignedUserIds) => {
    if (isDev) {
      const newTask = {
        id: generateUUID(),
        ...task,
        status: task.status || 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      devTasks.push(newTask)

      if (assignedUserIds?.length > 0) {
        for (const userId of assignedUserIds) {
          devTaskAssignments.push({
            id: generateUUID(),
            task_id: newTask.id,
            user_id: userId,
            created_at: new Date().toISOString(),
          })
        }
      }

      return newTask
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()
    if (error) throw error

    if (assignedUserIds?.length > 0) {
      const assignments = assignedUserIds.map(userId => ({
        task_id: data.id,
        user_id: userId,
      }))
      const { error: assignError } = await supabase
        .from('task_assignments')
        .insert(assignments)
      if (assignError) throw assignError
    }

    return data
  },

  update: async (id, updates) => {
    if (isDev) {
      const idx = devTasks.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Task not found')
      devTasks[idx] = { ...devTasks[idx], ...updates, updated_at: new Date().toISOString() }
      return devTasks[idx]
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (isDev) {
      const idx = devTasks.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Task not found')
      devTasks.splice(idx, 1)
      devTaskAssignments = devTaskAssignments.filter(a => a.task_id !== id)
      devRemarks = devRemarks.filter(r => r.task_id !== id)
      return
    }

    await supabase.from('task_assignments').delete().eq('task_id', id)
    await supabase.from('remarks').delete().eq('task_id', id)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  updateAssignments: async (taskId, userIds) => {
    if (isDev) {
      devTaskAssignments = devTaskAssignments.filter(a => a.task_id !== taskId)
      for (const userId of userIds) {
        devTaskAssignments.push({
          id: generateUUID(),
          task_id: taskId,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
      }
      return
    }

    await supabase.from('task_assignments').delete().eq('task_id', taskId)
    if (userIds.length > 0) {
      const assignments = userIds.map(userId => ({ task_id: taskId, user_id: userId }))
      const { error } = await supabase.from('task_assignments').insert(assignments)
      if (error) throw error
    }
  },

  getAssignedToUser: async (userId) => {
    if (isDev) {
      const assignedTaskIds = devTaskAssignments
        .filter(a => a.user_id === userId)
        .map(a => a.task_id)
      return devTasks
        .filter(t => assignedTaskIds.includes(t.id))
        .map(task => {
          const remarks = devRemarks
            .filter(r => r.task_id === task.id)
            .map(r => {
              const user = devUsers.find(u => u.id === r.user_id)
              return { ...r, users: user ? { name: user.name } : null }
            })
          return { ...task, remarks }
        })
        .sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date))
    }

    const { data, error } = await supabase
      .from('task_assignments')
      .select(`
        tasks (
          *,
          remarks (
            id,
            user_id,
            message,
            created_at,
            users (name)
          )
        )
      `)
      .eq('user_id', userId)
      .order('schedule_date', { ascending: true, foreignTable: 'tasks' })
    if (error) throw error
    return data.map(a => a.tasks)
  },

  addRemark: async (taskId, userId, message) => {
    if (isDev) {
      const newRemark = {
        id: generateUUID(),
        task_id: taskId,
        user_id: userId,
        message,
        created_at: new Date().toISOString(),
      }
      devRemarks.push(newRemark)
      return newRemark
    }

    const { data, error } = await supabase
      .from('remarks')
      .insert({ task_id: taskId, user_id: userId, message })
      .select()
      .single()
    if (error) throw error
    return data
  },

  subscribeToTasks: (callback) => {
    if (isDev) {
      return {
        unsubscribe: () => {},
      }
    }

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        callback(payload)
      })
      .subscribe()
    return channel
  },

  subscribeToRemarks: (taskId, callback) => {
    if (isDev) {
      return {
        unsubscribe: () => {},
      }
    }

    const channel = supabase
      .channel(`remarks-${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'remarks', filter: `task_id=eq.${taskId}` }, payload => {
        callback(payload)
      })
      .subscribe()
    return channel
  },
}

export const userService = {
  getAll: async () => {
    if (isDev) {
      return [...devUsers].sort((a, b) => a.name.localeCompare(b.name))
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  getLinemen: async () => {
    if (isDev) {
      return devUsers.filter(u => u.role === 'lineman').sort((a, b) => a.name.localeCompare(b.name))
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'lineman')
      .order('name')
    if (error) throw error
    return data
  },

  create: async (userData) => {
    if (isDev) {
      const newUser = {
        id: generateUUID(),
        ...userData,
        created_at: new Date().toISOString(),
      }
      devUsers.push(newUser)
      return newUser
    }

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    if (isDev) {
      const idx = devUsers.findIndex(u => u.id === id)
      if (idx === -1) throw new Error('User not found')
      devUsers[idx] = { ...devUsers[idx], ...updates }
      return devUsers[idx]
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (isDev) {
      const idx = devUsers.findIndex(u => u.id === id)
      if (idx === -1) throw new Error('User not found')
      if (id === DEV_USER_ID) throw new Error('Cannot delete dev admin user')
      devUsers.splice(idx, 1)
      devTaskAssignments = devTaskAssignments.filter(a => a.user_id !== id)
      devRemarks = devRemarks.filter(r => r.user_id !== id)
      return
    }

    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  },
}

export const dashboardService = {
  getStats: async () => {
    if (isDev) {
      const linemen = devUsers.filter(u => u.role === 'lineman')
      return {
        total: devTasks.length,
        pending: devTasks.filter(t => t.status === 'Pending').length,
        in_progress: devTasks.filter(t => t.status === 'In Progress').length,
        completed: devTasks.filter(t => t.status === 'Completed').length,
        total_linemen: linemen.length,
      }
    }

    const { data: tasks, error: taskError } = await supabase.from('tasks').select('status')
    if (taskError) throw taskError

    const { data: linemen, error: linemenError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'lineman')
    if (linemenError) throw linemenError

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      in_progress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      total_linemen: linemen.length,
    }

    return stats
  },
}
