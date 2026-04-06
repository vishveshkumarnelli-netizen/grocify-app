import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { loginUser } from '../services/api'
import { useAuthStore } from '../context/store'

export default function LoginPage() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const { login }     = useAuthStore()

  const [form, setForm]         = useState({ email:'', password:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const redirect = params.get('redirect') || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginUser(form)
      login(data)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 🎉`)
      navigate(redirect)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-forest-400 to-forest-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🥦</div>
            <h1 className="font-display text-3xl font-black text-gray-900">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your Grocify account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))}
                  className="input-base pl-11" placeholder="you@example.com"/>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-forest-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({...f, password:e.target.value}))}
                  className="input-base pl-11 pr-11" placeholder="Your password"/>
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 rounded-xl text-base mt-2 disabled:opacity-60">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing In…</> : '🔑 Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-600 font-semibold hover:underline">Create one →</Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 bg-forest-50 rounded-xl p-3 text-xs text-forest-700 text-center">
            <div className="font-bold mb-0.5">Demo Admin Account:</div>
            admin@grocify.in / admin123
          </div>
        </div>
      </div>
    </div>
  )
}
