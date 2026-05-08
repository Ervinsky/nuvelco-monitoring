import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRight, Eye, EyeOff, AlertCircle, Shield, Zap } from 'lucide-react'
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
        const data = await login(formData.email, formData.password)
        if (data?.user) {
          navigate('/dashboard', { replace: true })
        } else {
          setError('Login succeeded but no user data returned. Please contact support.')
        }
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
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.5; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 8s ease-in-out infinite; animation-delay: -3s; }
        .animate-slide-up { animation: slideUp 0.7s ease-out forwards; }
        .animate-slide-up-delayed { animation: slideUp 0.7s ease-out 0.15s forwards; opacity: 0; }
        .animate-slide-up-slow { animation: slideUp 0.7s ease-out 0.3s forwards; opacity: 0; }
        .animate-fade-scale { animation: fadeScale 0.5s ease-out forwards; }
        .animate-shimmer {
          background: linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.1) 50%, rgba(16,185,129,0) 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
      `}</style>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060b18]/95 backdrop-blur-xl animate-fade-scale">
          <div className="relative mb-6">
            <div className="absolute inset-0 w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse-ring" />
            <div className="absolute inset-0 w-28 h-28 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="w-28 h-28 flex items-center justify-center">
              <img src="/logo-nuv.png" alt="NUVELCO Logo" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-wide">
            {isSignup ? 'Creating Account' : 'Signing In'}
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            {isSignup ? 'Setting up your account...' : 'Verifying your credentials...'}
          </p>
          <div className="mt-8 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
          </div>
        </div>
      )}

      <div className="relative min-h-screen flex overflow-hidden bg-[#060b18]">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-emerald-400/5 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />

        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/background-nuv.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#060b18]/80 via-[#0a1628]/70 to-[#060b18]/90" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 flex items-center justify-center w-full px-6 lg:px-16">
          <div className="flex items-center gap-20 lg:gap-28">
            {/* Left branding */}
            <div className="hidden lg:flex flex-col items-start max-w-md">
              <div className="relative mb-8">
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl" />
                <img src="/logo-nuv.png" alt="NUVELCO Logo" className="w-20 h-20 object-contain relative" />
              </div>
              <h1 className="font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-gradient" style={{ fontSize: '56px', lineHeight: '1.1' }}>
                NUVELCO
              </h1>
              <div className="mt-6 space-y-2">
                <p className="text-3xl font-bold text-white/90 tracking-tight">Scheduled Monitoring</p>
                <p className="text-3xl font-bold text-white/90 tracking-tight">Management System</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-8 h-px bg-emerald-500/40" />
                <span>Secure by the OJTS' Access, Aldersgate College</span>
              </div>
            </div>

            {/* Login card */}
            <div className="relative w-full max-w-[420px]">
              {/* Backward border - only on sides, white, behind the card */}
              <div className="absolute -left-1 -right-1 top-2 bottom-2 rounded-xl border border-white/[0.06]" />
              <div className="absolute -left-[3px] -right-[3px] top-4 bottom-4 rounded-xl border border-white/10" />

            <Card className="relative w-full bg-[#0d1b2a]/80 backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-emerald-500/5 overflow-hidden animate-fade-scale">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

              <div className="relative px-8 pt-10 pb-4 flex flex-col items-center">
                <div className="relative mb-5">
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-emerald-500/10 blur-md" />
                  <img src="/logo-nuv.png" alt="NUVELCO Logo" className="w-14 h-14 object-contain relative" />
                </div>

                <CardHeader className="text-center p-0 mb-6">
                  <CardTitle className="text-white/90 text-xl font-semibold tracking-tight">
                    {isSignup ? 'Create Account' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-sm mt-1.5">
                    {isSignup ? 'Register to manage schedules and tasks' : 'Sign in to access your dashboard'}
                  </CardDescription>
                </CardHeader>
              </div>

              <CardContent className="px-8 pb-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignup && (
                    <div className="animate-slide-up">
                      <Input
                        label="Full Name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  )}

                  <div className={isSignup ? 'animate-slide-up-delayed' : ''}>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={isSignup ? 'animate-slide-up-slow' : ''}>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        minLength={6}
                        className="flex h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 pr-10 py-2 text-sm text-white/90 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:border-emerald-500/40 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div className="space-y-2 animate-slide-up-slow">
                      <label className="block text-sm font-medium text-gray-400">Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'admin' })}
                          className={`relative flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-all duration-200 ${
                            formData.role === 'admin'
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-4px_rgba(16,185,129,0.2)]'
                              : 'border-white/[0.06] bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:border-white/10'
                          }`}
                        >
                          {formData.role === 'admin' && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/5 to-transparent animate-shimmer" />
                          )}
                          <Shield className="w-4 h-4 relative" />
                          <span className="relative">Admin</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'lineman' })}
                          className={`relative flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-all duration-200 ${
                            formData.role === 'lineman'
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-4px_rgba(16,185,129,0.2)]'
                              : 'border-white/[0.06] bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:border-white/10'
                          }`}
                        >
                          {formData.role === 'lineman' && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/5 to-transparent animate-shimmer" />
                          )}
                          <Zap className="w-4 h-4 relative" />
                          <span className="relative">Lineman</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-500/8 border border-red-500/15 rounded-lg animate-fade-scale">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="relative w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 overflow-hidden group"
                    disabled={loading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />}
                    </span>
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-0 px-8 pb-8 pt-4">
                <div className="w-full flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                    {isSignup ? 'Registered?' : 'New here?'}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>
                <button
                  onClick={switchMode}
                  className="group text-sm font-medium text-gray-500 hover:text-emerald-400 transition-colors duration-200"
                >
                  <span className="inline-flex items-center gap-1">
                    {isSignup ? 'Sign In' : 'Create an Account'}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </span>
                </button>
                <p className="mt-5 text-center text-gray-600 text-[11px] tracking-wider uppercase">
                  Secure by the OJTS' Access, Aldersgate College
                </p>
              </CardFooter>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
