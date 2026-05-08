import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { X, User, Lock, Save } from 'lucide-react'
import { Button, Input } from './shadcn/index.js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './shadcn/dialog.jsx'

const ProfileModal = ({ isOpen, onClose }) => {
  const { profile, user, updateProfile, updatePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) setName(profile.name || '')
  }, [profile])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      if (!name.trim()) { setError('Name is required'); setSaving(false); return }
      await updateProfile({ name: name.trim() })
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { setError(err.message || 'Failed to update profile') }
    finally { setSaving(false) }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      if (!newPassword) { setError('New password is required'); setSaving(false); return }
      if (newPassword.length < 6) { setError('Password must be at least 6 characters'); setSaving(false); return }
      if (newPassword !== confirmPassword) { setError('Passwords do not match'); setSaving(false); return }
      await updatePassword(newPassword)
      setSuccess('Password updated successfully')
      setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { setError(err.message || 'Failed to update password') }
    finally { setSaving(false) }
  }

  const handleClose = () => {
    setActiveTab('profile'); setName(profile?.name || '')
    setNewPassword(''); setConfirmPassword(''); setError(''); setSuccess('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Account Settings</DialogTitle>
          <DialogClose onClick={handleClose} />
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button onClick={() => { setActiveTab('profile'); setError(''); setSuccess('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            <User className="w-4 h-4" /> Profile
          </button>
          <button onClick={() => { setActiveTab('password'); setError(''); setSuccess('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'password' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            <Lock className="w-4 h-4" /> Password
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800/50 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
                <input type="text" value={profile?.role || ''} disabled className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800/50 text-gray-400 capitalize cursor-not-allowed" />
              </div>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{error}</div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg">{success}</div>}
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm rounded-lg">
                Enter your new password below.
              </div>
              <Input type="password" label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" minLength={6} />
              <Input type="password" label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" minLength={6} />
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{error}</div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg">{success}</div>}
              <Button type="submit" disabled={saving} className="w-full">
                <Lock className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileModal
