import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/shadcn/card'
import { Button } from '../components/shadcn/button'
import { Input } from '../components/shadcn/input'

const LoginPage = () => {
  const { login, signup, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'lineman' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsSignup(false)
    setFormData({ name: '', email: '', password: '', role: 'lineman' })
    setShowPassword(false)
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const validateForm = () => {
    if (isSignup) {
      if (!formData.name.trim()) {
        setError('Full name is required')
        return false
      }
      if (formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters')
        return false
      }
    }
    if (!formData.email.trim()) {
      setError('Email address is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isSignup) {
        const data = await signup(formData.email, formData.password, formData.name.trim(), formData.role)
        if (data?.session) {
          navigate('/dashboard', { replace: true })
        } else {
          setIsSignup(false)
          setFormData({ name: '', email: '', password: '', role: 'lineman' })
        }
      } else {
        await login(formData.email, formData.password)
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const message = err.message || 'An error occurred. Please try again.'
      if (message.includes('Invalid login credentials') || message.includes('invalid_email') || message.includes('invalid_password')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
        setError('Please verify your email address before signing in.')
      } else if (message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setFormData({ name: '', email: '', password: '', role: 'lineman' })
    setShowPassword(false)
  }

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-logo {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .animate-slide-right {
          animation: slideInRight 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-pulse-logo {
          animation: pulse-logo 1.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Login/Signup Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1a]/95 backdrop-blur-sm animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin-slow" />
            <div className="w-24 h-24 flex items-center justify-center animate-pulse-logo">
              <img src="/logo-nuv.png" alt="NUVELCO Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white tracking-wide">
            {isSignup ? 'Creating Account' : 'Signing In'}
          </h2>
          <p className="mt-2 text-gray-400">
            {isSignup ? 'Please wait while we set up your account...' : 'Verifying your credentials...'}
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <div className="relative min-h-screen flex overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/background-nuv.jpg)', filter: 'blur(8px)', transform: 'scale(1.1)' }}
        />
        <div className="absolute inset-0 bg-gray-900/50" />

        {/* Content centered */}
        <div className="relative z-10 flex items-center justify-center w-full px-8 lg:px-16">
          <div className="flex items-center gap-16 lg:gap-24">
            {/* Left branding */}
            <div className="hidden lg:flex flex-col items-start animate-slide-left">
              <h1 className="font-bold text-emerald-500 tracking-tight" style={{ fontSize: '55px' }}>
                NUVELCO
              </h1>
              <div className="mt-4 space-y-1">
                <h2 className="font-semibold text-white" style={{ fontSize: '42px' }}>Scheduled Monitoring</h2>
                <h2 className="font-semibold text-white" style={{ fontSize: '42px' }}>Management System</h2>
              </div>
            </div>

            {/* Login card */}
            <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700 shadow-2xl w-full max-w-md animate-slide-right">
              <div className="flex justify-center pt-8">
                <img src="/logo-nuv.png" alt="NUVELCO Logo" className="w-16 h-16 object-contain" />
              </div>

              <CardHeader className="text-center pt-4 pb-2">
                <CardTitle className="text-white text-2xl">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  {isSignup ? 'Register to manage schedules and tasks' : 'Sign in to access your dashboard'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignup && (
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        minLength={6}
                        className="flex h-10 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 pr-10 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={formData.role === 'admin' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, role: 'admin' })}
                        >
                          Admin
                        </Button>
                        <Button
                          type="button"
                          variant={formData.role === 'lineman' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, role: 'lineman' })}
                        >
                          Lineman
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <p className="text-center text-sm text-gray-500">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={switchMode}
                    className="text-emerald-500 font-medium hover:underline"
                  >
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
                <p className="text-center text-gray-500 text-xs">
                  Secure Admin Access Only &bull; Solano Nueva Vizcaya
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
