import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { adminLogin } from '../services/api'
import { useAdminStore } from '../context/store'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAdminStore()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminLogin(form)
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.')
        return
      }
      login(data)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-700 via-forest-600 to-forest-800 flex items-center justify-center px-4">
      {/* Background circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-300/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"/>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-forest-400 to-forest-700 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">🥦</div>
            <h1 className="font-display text-3xl font-black text-gray-900">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to manage your Grocify store</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <FiAlertCircle size={16} className="shrink-0"/>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input pl-10" placeholder="admin@grocify.in"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pl-10 pr-10" placeholder="Your password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-green justify-center py-3.5 text-base rounded-xl mt-2">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing In…</>
                : '🔑 Sign In to Admin'}
            </button>
          </form>

          <div className="mt-6 bg-forest-50 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-forest-700 mb-1">Demo Credentials</p>
            <p className="text-xs text-forest-600 font-mono">admin@grocify.in</p>
            <p className="text-xs text-forest-600 font-mono">admin123</p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-5">
          Grocify Admin Panel v1.0 · For authorized personnel only
        </p>
      </div>
    </div>
  )
}
