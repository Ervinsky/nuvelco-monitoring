import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const useFallback = import.meta.env.DEV || !supabase

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const devUserRoles = {}

const buildProfile = (authUser) => ({
  id: authUser.id,
  name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
  role: authUser.user_metadata?.role || 'lineman',
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (authUser) => {
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error?.code === 'PGRST116') {
        const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
        const role = authUser.user_metadata?.role || 'lineman'
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{ id: authUser.id, name, role }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          return buildProfile(authUser)
        }
        data = newProfile
      } else if (error) {
        console.error('Profile fetch error:', error)
        return buildProfile(authUser)
      }

      return data
    } catch (err) {
      console.error('Profile error:', err)
      return null
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      if (useFallback) {
        if (sessionStorage.getItem('dev_logged_out') === 'true') {
          setLoading(false)
          return
        }
        const devUserId = '00000000-0000-0000-0000-000000000001'
        const lastEmail = sessionStorage.getItem('dev_last_email')
        const email = lastEmail || 'lineman@nuvelco.com'
        const role = sessionStorage.getItem('dev_last_role') || 'lineman'
        setUser({ id: devUserId, email, user_metadata: { name: email.split('@')[0], role } })
        setProfile({ id: devUserId, name: email.split('@')[0], role })
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const profileData = await loadUserProfile(session.user)
          if (profileData) {
            setProfile(profileData)
          } else {
            setProfile(buildProfile(session.user))
          }
        }
      } catch (err) {
        console.error('Session error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!useFallback) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(session.user)
          setProfile(buildProfile(session.user))
          loadUserProfile(session.user).then(profileData => {
            if (profileData) setProfile(profileData)
          })
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })
      initAuth()
      return () => subscription.unsubscribe()
    } else {
      initAuth()
    }
  }, [])

  const login = async (email, password) => {
    if (useFallback) {
      sessionStorage.removeItem('dev_logged_out')
      const normalizedEmail = email.trim().toLowerCase()
      sessionStorage.setItem('dev_last_email', normalizedEmail)
      if (!devUserRoles[normalizedEmail]) {
        devUserRoles[normalizedEmail] = 'lineman'
      }
      const role = devUserRoles[normalizedEmail]
      sessionStorage.setItem('dev_last_role', role)
      const devUserId = '00000000-0000-0000-0000-000000000001'
      setUser({ id: devUserId, email: normalizedEmail, user_metadata: { name: normalizedEmail.split('@')[0], role } })
      setProfile({ id: devUserId, name: normalizedEmail.split('@')[0], role })
      setLoading(false)
      return { user: { id: devUserId } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    if (data?.user) {
      setUser(data.user)
      const profileData = await loadUserProfile(data.user)
      if (profileData) {
        setProfile(profileData)
      } else {
        setProfile(buildProfile(data.user))
      }
    }

    return data
  }

  const signup = async (email, password, name, role) => {
    if (useFallback) {
      sessionStorage.removeItem('dev_logged_out')
      const normalizedEmail = email.trim().toLowerCase()
      sessionStorage.setItem('dev_last_email', normalizedEmail)
      sessionStorage.setItem('dev_last_role', role)
      devUserRoles[normalizedEmail] = role
      const devUserId = '00000000-0000-0000-0000-000000000001'
      setUser({ id: devUserId, email: normalizedEmail, user_metadata: { name, role } })
      setProfile({ id: devUserId, name, role })
      setLoading(false)
      return { session: { user: { id: devUserId } } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })
    if (error) throw error
    
    if (data?.session) {
      setUser(data.session.user)
      setProfile(buildProfile(data.session.user))
      loadUserProfile(data.session.user).then(profileData => {
        if (profileData) setProfile(profileData)
      }).catch(() => {})
    }
    
    return data
  }

  const logout = async () => {
    if (useFallback) {
      sessionStorage.setItem('dev_logged_out', 'true')
      sessionStorage.removeItem('dev_last_email')
      sessionStorage.removeItem('dev_last_role')
      setUser(null)
      setProfile(null)
      setLoading(false)
      window.location.replace('/login')
      return
    }
    try {
      setUser(null)
      setProfile(null)
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Supabase signOut error:', error)
      window.location.replace('/login')
    } catch (err) {
      console.error('Logout error:', err)
      setUser(null)
      setProfile(null)
      window.location.replace('/login')
    }
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    if (useFallback) {
      setProfile(prev => ({ ...prev, ...updates }))
      return { ...profile, ...updates }
    }
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  const updatePassword = async (newPassword) => {
    if (useFallback) {
      throw new Error('Password update is not available in dev mode')
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}
