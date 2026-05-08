import { useState, useEffect } from 'react'
import { userService } from '../services/supabase'
import { Card, Button, Modal, Input, Select, Badge, Toast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui'
import { Plus, Edit, Trash2, Users, AlertTriangle } from 'lucide-react'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'lineman' })
  const [toast, setToast] = useState(null)
  const [filterRole, setFilterRole] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null, loading: false })

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setToast({ message: 'Failed to load users: ' + err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await userService.update(editingUser.id, {
          name: formData.name,
          role: formData.role,
        })
        setToast({ message: 'User updated successfully', type: 'success' })
      } else {
        setToast({ message: 'Please create users via the signup page or Supabase dashboard. Then update their profile here.', type: 'info' })
        setShowModal(false)
        setEditingUser(null)
        setFormData({ name: '', email: '', password: '', role: 'lineman' })
        return
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'lineman' })
      fetchUsers()
    } catch (err) {
      setToast({ message: 'Failed to update user: ' + err.message, type: 'error' })
    }
  }

  const confirmDelete = (user) => {
    setDeleteDialog({ open: true, user, loading: false })
  }

  const handleDelete = async () => {
    if (!deleteDialog.user) return
    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await userService.delete(deleteDialog.user.id)
      setToast({ message: 'User deleted successfully', type: 'success' })
      fetchUsers()
    } catch (err) {
      setToast({ message: 'Failed to delete user: ' + err.message, type: 'error' })
    } finally {
      setDeleteDialog({ open: false, user: null, loading: false })
    }
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: '', password: '', role: user.role })
    setShowModal(true)
  }

  const filteredUsers = users.filter(u =>
    filterRole ? u.role === filterRole : true
  )

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 mt-1">Manage system users and roles</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'lineman' }); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Users className="w-5 h-5 text-gray-400" />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="lineman">Lineman</option>
          </select>
          <span className="text-sm text-gray-400">{filteredUsers.length} users</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          filteredUsers.map(user => (
            <Card key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'danger' : 'primary'}>
                      {user.role === 'admin' ? 'Admin' : 'Lineman'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-danger" onClick={() => confirmDelete(user)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null) }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'lineman', label: 'Lineman' },
            ]}
          />

          {!editingUser ? (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm rounded-lg">
              To create a new user: Have them sign up via the login page, then update their name/role here.
            </div>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm rounded-lg">
              Note: Email and password can only be changed in Supabase dashboard.
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingUser(null) }}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(v) => { if (!v && !deleteDialog.loading) setDeleteDialog({ open: false, user: null, loading: false }) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">Delete User</DialogTitle>
                <p className="text-sm text-gray-400 mt-1">This action cannot be undone.</p>
              </div>
            </div>
          </DialogHeader>
          {deleteDialog.user && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {deleteDialog.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{deleteDialog.user.name}</p>
                  <Badge variant={deleteDialog.user.role === 'admin' ? 'danger' : 'primary'}>
                    {deleteDialog.user.role === 'admin' ? 'Admin' : 'Lineman'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null, loading: false })} disabled={deleteDialog.loading}>Cancel</Button>
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleDelete} disabled={deleteDialog.loading}>
              {deleteDialog.loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

export default UsersPage
